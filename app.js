// ============================================================
// Sam's Project Tracker v2 — Application Logic
// Modular object pattern: DataStore, Renderer, Modal, Actions, App
// Spec: SAMS_PROJECT_TRACKER_V2_SPEC.md
// ============================================================

/* ── DataStore ── */
const DataStore = {
  STORAGE_KEY: 'sams-project-tracker-v2',

  load() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        return {
          projects: data.projects || [],
          ongoing: data.ongoing || []
        };
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }
    return null;
  },

  save(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      projects: data.projects,
      ongoing: data.ongoing,
      lastSaved: new Date().toISOString()
    }));
  },

  init() {
    let data = this.load();
    if (!data) {
      data = {
        projects: JSON.parse(JSON.stringify(SEED_PROJECTS)),
        ongoing: JSON.parse(JSON.stringify(SEED_ONGOING))
      };
      this.save(data);
    }
    return data;
  },

  getProject(id) {
    const data = this.load();
    return data ? data.projects.find(p => p.id === id) : null;
  },

  updateProject(id, updates) {
    const data = this.load();
    if (!data) return;
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return;
    data.projects[idx] = { ...data.projects[idx], ...updates };
    this.save(data);
    return data;
  },

  addProject(project) {
    const data = this.load();
    if (!data) return;
    data.projects.push(project);
    this.save(data);
    return data;
  },

  deleteProject(id) {
    const data = this.load();
    if (!data) return;
    data.projects = data.projects.filter(p => p.id !== id);
    this.save(data);
    return data;
  },

  exportJSON() {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  },

  importJSON(jsonString) {
    const data = JSON.parse(jsonString);
    if (!data.projects || !Array.isArray(data.projects)) {
      throw new Error('Invalid format: missing projects array');
    }
    if (!data.ongoing) data.ongoing = [];
    this.save(data);
    return data;
  }
};

/* ── Utility Helpers ── */
const Utils = {
  timeAgo(dateStr) {
    if (!dateStr) return 'Never';
    const now = new Date();
    const date = new Date(dateStr + 'T00:00:00');
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Future';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  },

  isStale(dateStr) {
    if (!dateStr) return true;
    const now = new Date();
    const date = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return diffDays >= STALE_DAYS;
  },

  phaseProgress(phases) {
    if (!phases || phases.length === 0) return { done: 0, total: 0, percent: 0 };
    const done = phases.filter(p => p.status === 'done').length;
    const total = phases.length;
    return { done, total, percent: Math.round((done / total) * 100) };
  },

  currentPhaseName(project) {
    if (!project.phases || project.phases.length === 0) return '';
    const current = project.phases.find(p => p.status === 'current');
    return current ? current.name : '';
  },

  generateId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40)
      + '-' + Date.now().toString(36);
  },

  priorityWeight(priority) {
    const weights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return weights[priority] || 0;
  },

  todayStr() {
    return new Date().toISOString().split('T')[0];
  }
};

/* ── Safe DOM builder helpers ── */
// All user-controlled text uses textContent (safe).
// Structure-only HTML (static markup, no user data) uses innerHTML on freshly created elements.
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function createEl(tag, className, textContent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent !== undefined) el.textContent = textContent;
  return el;
}

/* ── Renderer ── */
const Renderer = {

  // Build a project card element (safe DOM construction)
  createCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-priority', project.priority);
    card.setAttribute('data-id', project.id);
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', project.name + ' \u2014 ' + project.status + ', ' + project.priority + ' priority');

    const stale = project.status !== 'Done' && Utils.isStale(project.lastWorkedOn);
    if (stale) card.classList.add('stale');

    const progress = Utils.phaseProgress(project.phases);
    const phaseName = Utils.currentPhaseName(project);
    const statusCfg = STATUS_CONFIG[project.status] || {};
    const catCfg = CATEGORY_CONFIG[project.category] || {};
    const priCfg = PRIORITY_CONFIG[project.priority] || {};

    // Top row: name + priority symbol
    const topRow = createEl('div', 'card-top');
    const nameEl = createEl('span', 'card-name', project.name);
    const priEl = createEl('span', 'card-priority', priCfg.symbol);
    priEl.setAttribute('data-priority', project.priority);
    priEl.setAttribute('aria-label', project.priority + ' priority');
    topRow.append(nameEl, priEl);

    // Meta badges
    const metaRow = createEl('div', 'card-meta');
    const catBadge = createEl('span', 'badge badge--category', catCfg.icon + ' ' + catCfg.label);
    const statusBadge = createEl('span', 'badge badge--status', statusCfg.icon + ' ' + statusCfg.label);
    metaRow.append(catBadge, statusBadge);
    if (stale) {
      metaRow.append(createEl('span', 'badge badge--stale', '\u26A0\uFE0F Stale'));
    }

    // Progress bar
    const progressDiv = createEl('div', 'card-progress');
    const progLabel = createEl('div', 'progress-label');
    progLabel.append(
      createEl('span', null, phaseName),
      createEl('span', null, 'Phase ' + progress.done + '/' + progress.total + ' (' + progress.percent + '%)')
    );
    const progBar = createEl('div', 'progress-bar');
    progBar.setAttribute('role', 'progressbar');
    progBar.setAttribute('aria-valuenow', progress.percent);
    progBar.setAttribute('aria-valuemin', '0');
    progBar.setAttribute('aria-valuemax', '100');
    const progFill = createEl('div', 'progress-fill');
    progFill.style.width = progress.percent + '%';
    progBar.appendChild(progFill);
    progressDiv.append(progLabel, progBar);

    // Next steps
    const nextEl = createEl('div', 'card-next-steps', project.nextSteps || '');

    // Time
    const timeEl = createEl('div', 'card-time');
    timeEl.append(createEl('span', null, Utils.timeAgo(project.lastWorkedOn)));

    card.append(topRow, metaRow, progressDiv, nextEl, timeEl);

    card.addEventListener('click', function() { Modal.openDetail(project.id); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        Modal.openDetail(project.id);
      }
    });

    return card;
  },

  // Build a focus card (expanded detail)
  createFocusCard(project) {
    const card = createEl('div', 'focus-card');
    card.setAttribute('data-priority', project.priority);

    const progress = Utils.phaseProgress(project.phases);
    const phaseName = Utils.currentPhaseName(project);
    const statusCfg = STATUS_CONFIG[project.status] || {};
    const catCfg = CATEGORY_CONFIG[project.category] || {};
    const priCfg = PRIORITY_CONFIG[project.priority] || {};
    const stale = Utils.isStale(project.lastWorkedOn);

    // Name
    card.append(createEl('div', 'card-name', project.name));

    // Meta badges
    const metaRow = createEl('div', 'card-meta');
    metaRow.append(
      createEl('span', 'badge badge--category', catCfg.icon + ' ' + catCfg.label),
      createEl('span', 'badge badge--status', statusCfg.icon + ' ' + statusCfg.label)
    );
    const priLabel = createEl('span', 'card-priority', priCfg.symbol + ' ' + project.priority);
    priLabel.setAttribute('data-priority', project.priority);
    metaRow.append(priLabel);
    if (stale) {
      metaRow.append(createEl('span', 'badge badge--stale', '\u26A0\uFE0F Stale'));
    }
    card.append(metaRow);

    // Progress bar
    const progressDiv = createEl('div', 'card-progress');
    const progLabel = createEl('div', 'progress-label');
    progLabel.append(
      createEl('span', null, phaseName),
      createEl('span', null, 'Phase ' + progress.done + '/' + progress.total + ' (' + progress.percent + '%)')
    );
    const progBar = createEl('div', 'progress-bar');
    progBar.setAttribute('role', 'progressbar');
    progBar.setAttribute('aria-valuenow', progress.percent);
    progBar.setAttribute('aria-valuemin', '0');
    progBar.setAttribute('aria-valuemax', '100');
    const progFill = createEl('div', 'progress-fill');
    progFill.style.width = progress.percent + '%';
    progBar.appendChild(progFill);
    progressDiv.append(progLabel, progBar);
    card.append(progressDiv);

    // Phase name
    card.append(createEl('div', 'focus-phase', phaseName));

    // Next steps
    const nextDiv = createEl('div', 'focus-next');
    const nextBold = createEl('strong', null, 'Next: ');
    nextDiv.append(nextBold);
    nextDiv.append(document.createTextNode(project.nextSteps || 'None'));
    card.append(nextDiv);

    // Latest note
    const latestNote = project.notes && project.notes.length > 0
      ? project.notes[project.notes.length - 1]
      : null;
    if (latestNote) {
      const noteDiv = createEl('div', 'focus-next');
      noteDiv.style.marginTop = '6px';
      noteDiv.style.color = 'var(--text-muted)';
      noteDiv.style.fontSize = '0.8rem';
      const noteBold = createEl('strong', null, 'Latest note (' + latestNote.date + '): ');
      noteDiv.append(noteBold);
      noteDiv.append(document.createTextNode(latestNote.text));
      card.append(noteDiv);
    }

    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', project.name + ' \u2014 focus card, click for details');
    card.addEventListener('click', function() { Modal.openDetail(project.id); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        Modal.openDetail(project.id);
      }
    });

    return card;
  },

  // Build an ongoing tool card
  createOngoingCard(tool) {
    const card = createEl('div', 'ongoing-card');
    card.append(
      createEl('div', 'card-name', tool.name),
      createEl('div', 'ongoing-desc', tool.description)
    );
    const timeEl = createEl('div', 'card-time');
    timeEl.append(createEl('span', null, Utils.timeAgo(tool.lastWorkedOn)));
    card.append(timeEl);
    return card;
  },

  // Render the full board
  renderBoard(data, filters, sortBy, showDone) {
    this.renderStats(data);
    this.renderFocus(data);
    this.renderKanban(data, filters, sortBy, showDone);
    this.renderOngoing(data);
    this.renderDoneCount(data);
  },

  renderStats(data) {
    const projects = data.projects;
    const active = projects.filter(function(p) { return p.status === 'Active'; }).length;
    const bsw = projects.filter(function(p) { return p.category === 'BSW' && p.status !== 'Done'; }).length;
    const personal = projects.filter(function(p) { return p.category === 'Personal' && p.status !== 'Done'; }).length;
    const stale = projects.filter(function(p) { return p.status !== 'Done' && Utils.isStale(p.lastWorkedOn); }).length;

    document.querySelector('#stat-active .stat-value').textContent = active;
    document.querySelector('#stat-bsw .stat-value').textContent = bsw;
    document.querySelector('#stat-personal .stat-value').textContent = personal;
    document.querySelector('#stat-stale .stat-value').textContent = stale;
    document.querySelector('#stat-updated .stat-value').textContent = Utils.todayStr();
  },

  renderFocus(data) {
    const container = document.getElementById('focus-cards');
    container.textContent = '';

    // Top 2-3 Critical/High Active projects
    const focusProjects = data.projects
      .filter(function(p) { return p.status === 'Active' && (p.priority === 'Critical' || p.priority === 'High'); })
      .sort(function(a, b) {
        const priDiff = Utils.priorityWeight(b.priority) - Utils.priorityWeight(a.priority);
        if (priDiff !== 0) return priDiff;
        return new Date(b.lastWorkedOn || 0) - new Date(a.lastWorkedOn || 0);
      })
      .slice(0, 3);

    if (focusProjects.length === 0) {
      container.append(createEl('p', null, 'No Critical/High Active projects right now.'));
      container.lastChild.style.color = 'var(--text-muted)';
      container.lastChild.style.fontSize = '0.85rem';
    } else {
      focusProjects.forEach(function(p) { container.appendChild(Renderer.createFocusCard(p)); });
    }
  },

  renderKanban(data, filters, sortBy, showDone) {
    const lanes = document.querySelectorAll('.kanban-lane');

    // Show/hide Done lane
    const doneLane = document.querySelector('.kanban-lane[data-status="Done"]');
    if (doneLane) {
      doneLane.classList.toggle('hidden', !showDone);
    }

    // Apply filters
    var filtered = data.projects.filter(function(p) {
      if (filters.category !== 'All' && filters.category !== 'Ongoing') {
        if (p.category !== filters.category) return false;
      }
      if (filters.category === 'Ongoing') return false;
      if (filters.status !== 'All' && p.status !== filters.status) return false;
      if (filters.priority !== 'All' && p.priority !== filters.priority) return false;
      return true;
    });

    // Sort
    filtered = this.sortProjects(filtered, sortBy);

    // Populate lanes
    lanes.forEach(function(lane) {
      var status = lane.dataset.status;
      var cardsContainer = lane.querySelector('.lane-cards');
      var countEl = lane.querySelector('.lane-count');
      var iconEl = lane.querySelector('.lane-icon');

      cardsContainer.textContent = '';

      var cfg = STATUS_CONFIG[status];
      if (cfg) iconEl.textContent = cfg.icon;

      var laneProjects = filtered.filter(function(p) { return p.status === status; });
      countEl.textContent = laneProjects.length;

      laneProjects.forEach(function(p) { cardsContainer.appendChild(Renderer.createCard(p)); });

      lane.classList.toggle('empty-filtered', laneProjects.length === 0 && filters.status === 'All');
    });
  },

  renderOngoing(data) {
    var container = document.getElementById('ongoing-cards');
    container.textContent = '';
    data.ongoing.forEach(function(tool) { container.appendChild(Renderer.createOngoingCard(tool)); });
  },

  renderDoneCount(data) {
    var count = data.projects.filter(function(p) { return p.status === 'Done'; }).length;
    document.getElementById('done-count').textContent = count;
  },

  sortProjects(projects, sortBy) {
    var sorted = projects.slice();
    switch (sortBy) {
      case 'lastWorked':
        sorted.sort(function(a, b) {
          var da = a.lastWorkedOn ? new Date(a.lastWorkedOn) : new Date(0);
          var db = b.lastWorkedOn ? new Date(b.lastWorkedOn) : new Date(0);
          return db - da;
        });
        break;
      case 'priority':
        sorted.sort(function(a, b) { return Utils.priorityWeight(b.priority) - Utils.priorityWeight(a.priority); });
        break;
      case 'name':
        sorted.sort(function(a, b) { return a.name.localeCompare(b.name); });
        break;
      case 'percentComplete':
        sorted.sort(function(a, b) { return Utils.phaseProgress(b.phases).percent - Utils.phaseProgress(a.phases).percent; });
        break;
    }
    return sorted;
  }
};

/* ── Modal ── */
const Modal = {

  openDetail(projectId) {
    var data = DataStore.load();
    var project = data.projects.find(function(p) { return p.id === projectId; });
    if (!project) return;

    var modal = document.getElementById('detail-modal');
    modal.classList.remove('hidden');
    modal.dataset.projectId = projectId;

    // Title
    document.getElementById('detail-modal-title').textContent = project.name;

    // Meta badges
    var meta = modal.querySelector('.modal-meta');
    meta.textContent = '';
    var catCfg = CATEGORY_CONFIG[project.category] || {};
    var statusCfg = STATUS_CONFIG[project.status] || {};
    var priCfg = PRIORITY_CONFIG[project.priority] || {};
    meta.append(
      createEl('span', 'badge badge--category', catCfg.icon + ' ' + catCfg.label),
      createEl('span', 'badge badge--status', statusCfg.icon + ' ' + statusCfg.label),
      createEl('span', 'badge', priCfg.symbol + ' ' + project.priority),
      createEl('span', 'badge', Utils.timeAgo(project.lastWorkedOn))
    );
    if (Utils.isStale(project.lastWorkedOn) && project.status !== 'Done') {
      meta.append(createEl('span', 'badge badge--stale', '\u26A0\uFE0F Stale'));
    }

    // Next steps
    modal.querySelector('.modal-next-text').textContent = project.nextSteps || 'None';

    // Phases
    var phaseList = document.getElementById('modal-phase-list');
    phaseList.textContent = '';
    (project.phases || []).forEach(function(phase) {
      var li = document.createElement('li');
      var icon, cls;
      if (phase.status === 'done') { icon = '\u2713'; cls = 'phase-done'; }
      else if (phase.status === 'current') { icon = '\u2192'; cls = 'phase-current'; }
      else { icon = '\u25CB'; cls = 'phase-pending'; }
      li.className = cls;
      var iconSpan = createEl('span', 'phase-icon', icon);
      li.append(iconSpan, document.createTextNode(' ' + phase.name));
      phaseList.appendChild(li);
    });

    // Notes (newest first)
    var notesList = document.getElementById('modal-notes-list');
    notesList.textContent = '';
    var notes = (project.notes || []).slice().reverse();
    if (notes.length === 0) {
      var emptyP = createEl('p', null, 'No notes yet.');
      emptyP.style.color = 'var(--text-muted)';
      emptyP.style.fontSize = '0.8rem';
      notesList.append(emptyP);
    } else {
      notes.forEach(function(note) {
        var entry = createEl('div', 'note-entry');
        entry.append(
          createEl('div', 'note-date', note.date),
          createEl('div', 'note-text', note.text)
        );
        notesList.appendChild(entry);
      });
    }

    this._trapFocus(modal);
  },

  closeDetail() {
    var modal = document.getElementById('detail-modal');
    modal.classList.add('hidden');
    delete modal.dataset.projectId;
  },

  openEdit(projectId) {
    this.closeDetail();
    var modal = document.getElementById('edit-modal');
    modal.classList.remove('hidden');

    var isNew = !projectId;
    document.getElementById('edit-modal-title').textContent = isNew ? 'Add Project' : 'Edit Project';

    if (isNew) {
      document.getElementById('edit-project-id').value = '';
      document.getElementById('edit-name').value = '';
      document.getElementById('edit-category').value = 'Personal';
      document.getElementById('edit-status').value = 'Planning';
      document.getElementById('edit-priority').value = 'Medium';
      document.getElementById('edit-next-steps').value = '';
      document.getElementById('edit-phases-container').textContent = '';
      document.getElementById('edit-notes-section').style.display = 'none';
      this._addPhaseRow('', 'pending');
    } else {
      var project = DataStore.getProject(projectId);
      if (!project) return;

      document.getElementById('edit-project-id').value = project.id;
      document.getElementById('edit-name').value = project.name;
      document.getElementById('edit-category').value = project.category;
      document.getElementById('edit-status').value = project.status;
      document.getElementById('edit-priority').value = project.priority;
      document.getElementById('edit-next-steps').value = project.nextSteps || '';

      var container = document.getElementById('edit-phases-container');
      container.textContent = '';
      (project.phases || []).forEach(function(phase) {
        Modal._addPhaseRow(phase.name, phase.status);
      });

      document.getElementById('edit-notes-section').style.display = '';
      this._renderEditNotes(project);
    }

    this._trapFocus(modal);
  },

  closeEdit() {
    document.getElementById('edit-modal').classList.add('hidden');
  },

  _addPhaseRow(name, status) {
    var container = document.getElementById('edit-phases-container');
    var row = createEl('div', 'phase-edit-row');

    var input = document.createElement('input');
    input.type = 'text';
    input.value = name;
    input.placeholder = 'Phase name';

    var select = document.createElement('select');
    ['pending', 'current', 'done'].forEach(function(val) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val.charAt(0).toUpperCase() + val.slice(1);
      if (val === status) opt.selected = true;
      select.appendChild(opt);
    });

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-phase';
    removeBtn.setAttribute('aria-label', 'Remove phase');
    removeBtn.textContent = '\u00D7';
    removeBtn.addEventListener('click', function() { row.remove(); });

    row.append(input, select, removeBtn);
    container.appendChild(row);
  },

  _renderEditNotes(project) {
    var container = document.getElementById('edit-notes-history');
    container.textContent = '';
    var notes = (project.notes || []).slice().reverse();
    notes.forEach(function(note) {
      var entry = createEl('div', 'note-entry');
      entry.append(
        createEl('div', 'note-date', note.date),
        createEl('div', 'note-text', note.text)
      );
      container.appendChild(entry);
    });
  },

  collectFormData() {
    var id = document.getElementById('edit-project-id').value;
    var name = document.getElementById('edit-name').value.trim();
    if (!name) return null;

    var phaseRows = document.querySelectorAll('#edit-phases-container .phase-edit-row');
    var phases = [];
    var currentPhase = 1;
    phaseRows.forEach(function(row, i) {
      var phaseName = row.querySelector('input').value.trim();
      var phaseStatus = row.querySelector('select').value;
      if (phaseName) {
        phases.push({ name: phaseName, status: phaseStatus });
        if (phaseStatus === 'current') currentPhase = i + 1;
      }
    });

    return {
      id: id || Utils.generateId(name),
      name: name,
      category: document.getElementById('edit-category').value,
      status: document.getElementById('edit-status').value,
      priority: document.getElementById('edit-priority').value,
      nextSteps: document.getElementById('edit-next-steps').value.trim(),
      phases: phases,
      currentPhase: currentPhase
    };
  },

  openAIPrompt(projectId) {
    var project = DataStore.getProject(projectId);
    if (!project) return;

    var modal = document.getElementById('ai-prompt-modal');
    modal.classList.remove('hidden');

    var phaseName = Utils.currentPhaseName(project);
    var prompt = 'Review my project "' + project.name + '" and give me a status update.\n'
      + 'Current recorded status: ' + project.status + ', Phase ' + project.currentPhase
      + ' (' + phaseName + '), last worked ' + (project.lastWorkedOn || 'never') + '.\n'
      + 'Search my past chats for recent activity on this project.\n'
      + 'Respond ONLY in this JSON format:\n'
      + '{\n'
      + '  "projectId": "' + project.id + '",\n'
      + '  "status": "' + project.status + '",\n'
      + '  "currentPhase": ' + project.currentPhase + ',\n'
      + '  "nextSteps": "...",\n'
      + '  "newNote": "...",\n'
      + '  "lastWorkedOn": "YYYY-MM-DD"\n'
      + '}';

    document.getElementById('ai-prompt-text').value = prompt;
    this._trapFocus(modal);
  },

  closeAIPrompt() {
    document.getElementById('ai-prompt-modal').classList.add('hidden');
  },

  _trapFocus(modal) {
    setTimeout(function() {
      var focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) focusable[0].focus();
    }, 50);
  }
};

/* ── Actions (AI Update, Export/Import) ── */
const Actions = {

  applyAIUpdate(jsonString) {
    var update;
    try {
      var cleaned = jsonString.trim();
      var jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) cleaned = jsonMatch[1].trim();
      update = JSON.parse(cleaned);
    } catch (e) {
      return { success: false, message: 'Invalid JSON. Check formatting and try again.' };
    }

    if (!update.projectId) {
      return { success: false, message: 'Missing projectId in update.' };
    }

    var data = DataStore.load();
    var project = data.projects.find(function(p) { return p.id === update.projectId; });
    if (!project) {
      return { success: false, message: 'Project "' + update.projectId + '" not found.' };
    }

    if (update.status) project.status = update.status;
    if (update.currentPhase) {
      project.currentPhase = update.currentPhase;
      project.phases.forEach(function(phase, i) {
        if (i + 1 < update.currentPhase) phase.status = 'done';
        else if (i + 1 === update.currentPhase) phase.status = 'current';
        else phase.status = 'pending';
      });
    }
    if (update.nextSteps) project.nextSteps = update.nextSteps;
    if (update.lastWorkedOn) project.lastWorkedOn = update.lastWorkedOn;

    if (update.newNote) {
      project.notes.push({
        date: Utils.todayStr(),
        text: update.newNote
      });
    }

    DataStore.save(data);
    return { success: true, message: 'Updated "' + project.name + '" successfully.' };
  },

  exportBackup() {
    var json = DataStore.exportJSON();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'project-tracker-backup-' + Utils.todayStr() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    App.toast('Backup exported');
  },

  importBackup(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        DataStore.importJSON(e.target.result);
        App.toast('Backup imported successfully');
        App.refresh();
      } catch (err) {
        App.toast('Import failed: ' + err.message, true);
      }
    };
    reader.readAsText(file);
  }
};

/* ── App (main controller) ── */
const App = {
  data: null,
  filters: { category: 'All', status: 'All', priority: 'All' },
  sortBy: 'lastWorked',
  showDone: false,

  init() {
    this.data = DataStore.init();
    this.bindEvents();
    this.render();
  },

  render() {
    Renderer.renderBoard(this.data, this.filters, this.sortBy, this.showDone);
  },

  refresh() {
    this.data = DataStore.load();
    this.render();
  },

  bindEvents() {
    var self = this;

    // Filter buttons
    document.querySelectorAll('.filter-buttons').forEach(function(group) {
      group.addEventListener('click', function(e) {
        var btn = e.target.closest('.filter-btn');
        if (!btn) return;

        group.querySelectorAll('.filter-btn').forEach(function(b) {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');

        var groupId = group.id;
        var value = btn.dataset.value;
        if (groupId === 'filter-category') self.filters.category = value;
        else if (groupId === 'filter-status') self.filters.status = value;
        else if (groupId === 'filter-priority') self.filters.priority = value;

        self.render();
      });
    });

    // Sort select
    document.getElementById('sort-select').addEventListener('change', function(e) {
      self.sortBy = e.target.value;
      self.render();
    });

    // Done toggle
    document.getElementById('toggle-done').addEventListener('change', function(e) {
      self.showDone = e.target.checked;
      self.render();
    });

    // HUD buttons
    document.getElementById('btn-add').addEventListener('click', function() { Modal.openEdit(null); });
    document.getElementById('btn-export').addEventListener('click', function() { Actions.exportBackup(); });
    document.getElementById('btn-import').addEventListener('click', function() {
      document.getElementById('file-import').click();
    });
    document.getElementById('file-import').addEventListener('change', function(e) {
      if (e.target.files[0]) Actions.importBackup(e.target.files[0]);
      e.target.value = '';
    });

    // Detail modal
    document.querySelector('#detail-modal .modal-close').addEventListener('click', function() { Modal.closeDetail(); });
    document.getElementById('detail-modal').addEventListener('click', function(e) {
      if (e.target === e.currentTarget) Modal.closeDetail();
    });

    document.getElementById('modal-edit').addEventListener('click', function() {
      var projectId = document.getElementById('detail-modal').dataset.projectId;
      Modal.openEdit(projectId);
    });

    document.getElementById('modal-delete').addEventListener('click', function() {
      var projectId = document.getElementById('detail-modal').dataset.projectId;
      if (confirm('Delete this project? This cannot be undone.')) {
        DataStore.deleteProject(projectId);
        Modal.closeDetail();
        self.refresh();
        self.toast('Project deleted');
      }
    });

    document.getElementById('modal-ai-prompt').addEventListener('click', function() {
      var projectId = document.getElementById('detail-modal').dataset.projectId;
      Modal.openAIPrompt(projectId);
    });

    // Edit modal
    document.querySelector('#edit-modal .modal-close').addEventListener('click', function() { Modal.closeEdit(); });
    document.getElementById('edit-modal').addEventListener('click', function(e) {
      if (e.target === e.currentTarget) Modal.closeEdit();
    });

    document.getElementById('btn-add-phase').addEventListener('click', function() {
      Modal._addPhaseRow('', 'pending');
    });

    document.getElementById('btn-add-note').addEventListener('click', function() {
      var input = document.getElementById('edit-new-note');
      var noteText = input.value.trim();
      if (!noteText) return;

      var projectId = document.getElementById('edit-project-id').value;
      if (!projectId) return;

      var data = DataStore.load();
      var project = data.projects.find(function(p) { return p.id === projectId; });
      if (!project) return;

      project.notes.push({ date: Utils.todayStr(), text: noteText });
      DataStore.save(data);
      Modal._renderEditNotes(project);
      input.value = '';
    });

    document.getElementById('project-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var formData = Modal.collectFormData();
      if (!formData) return;

      var existingId = document.getElementById('edit-project-id').value;
      if (existingId) {
        DataStore.updateProject(existingId, {
          name: formData.name,
          category: formData.category,
          status: formData.status,
          priority: formData.priority,
          nextSteps: formData.nextSteps,
          phases: formData.phases,
          currentPhase: formData.currentPhase,
          lastWorkedOn: Utils.todayStr()
        });
        self.toast('Project updated');
      } else {
        DataStore.addProject({
          id: formData.id,
          name: formData.name,
          category: formData.category,
          status: formData.status,
          priority: formData.priority,
          nextSteps: formData.nextSteps,
          phases: formData.phases,
          currentPhase: formData.currentPhase,
          notes: [],
          lastWorkedOn: Utils.todayStr(),
          createdAt: Utils.todayStr()
        });
        self.toast('Project created');
      }

      Modal.closeEdit();
      self.refresh();
    });

    // AI Prompt modal
    document.querySelector('#ai-prompt-modal .modal-close').addEventListener('click', function() { Modal.closeAIPrompt(); });
    document.getElementById('ai-prompt-modal').addEventListener('click', function(e) {
      if (e.target === e.currentTarget) Modal.closeAIPrompt();
    });

    document.getElementById('ai-prompt-copy').addEventListener('click', function() {
      var text = document.getElementById('ai-prompt-text').value;
      navigator.clipboard.writeText(text).then(function() {
        self.toast('Prompt copied to clipboard');
      });
    });

    // AI Update apply
    document.getElementById('ai-update-apply').addEventListener('click', function() {
      var input = document.getElementById('ai-update-input');
      var statusEl = document.getElementById('ai-update-status');
      var result = Actions.applyAIUpdate(input.value);

      statusEl.textContent = result.message;
      statusEl.className = 'ai-status' + (result.success ? '' : ' error');

      if (result.success) {
        input.value = '';
        self.refresh();
      }
    });

    // Global keyboard
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        Modal.closeDetail();
        Modal.closeEdit();
        Modal.closeAIPrompt();
      }
    });
  },

  toast(message, isError) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.toggle('error', !!isError);
    el.classList.add('visible');
    setTimeout(function() { el.classList.remove('visible'); }, 2500);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', function() { App.init(); });
