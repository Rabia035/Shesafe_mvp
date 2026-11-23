const STORAGE_KEY = 'shesafe_mvp_state_v2';

// ==================== INITIAL SEEDED STATE ====================
const DEFAULT_STATE = {
  pitchDemoMode: true,
  activeRole: 'student',
  activeStudentTab: 'routes',
  timeSlotFilter: 'all',
  selectedRouteId: 'r1',
  modalDriverId: null,
  tripActive: true,
  rideProgress: 65,
  lastUpdatedLabel: 'Updated just now',
  guardianName: 'Tariq Aziz',
  guardianPhone: '+92 300 5550192',
  guardianPasscode: 'SAFE-8421',
  lastShareLink: '',
  routes: [
    {
      id: 'r1',
      name: 'Satellite Town → Main Gate',
      vanCode: 'Van #SH-104',
      vehiclePlate: 'RIK-4821',
      vehicleModel: 'Suzuki HiRoof (AC)',
      timeSlot: 'Morning',
      pickupTime: '07:45 AM',
      returnTime: '02:30 PM',
      monthlyFare: 4200,
      seatsAvailable: 4,
      totalSeats: 14,
      stops: ['Satellite Town Block C', '6th Road Stop', 'Main Boulevard', 'Campus Gate 1'],
      driverId: 'd1'
    },
    {
      id: 'r2',
      name: 'Model Town & Canal → Campus',
      vanCode: 'Van #SH-209',
      vehiclePlate: 'LWE-9034',
      vehicleModel: 'Toyota Hiace Commuter',
      timeSlot: 'Mid-Day',
      pickupTime: '10:15 AM',
      returnTime: '04:00 PM',
      monthlyFare: 4800,
      seatsAvailable: 6,
      totalSeats: 16,
      stops: ['Model Town Link', 'Canal Underpass', 'Library Stop', 'Campus Gate 2'],
      driverId: 'd2'
    },
    {
      id: 'r3',
      name: 'Gulberg & City → Lab Block',
      vanCode: 'Van #SH-312',
      vehiclePlate: 'FDL-1190',
      vehicleModel: 'Suzuki Bolan (Budget)',
      timeSlot: 'Late Lab',
      pickupTime: '01:30 PM',
      returnTime: '06:15 PM',
      monthlyFare: 3600,
      seatsAvailable: 3,
      totalSeats: 10,
      stops: ['Gulberg Chowk', 'Clock Tower Stop', 'Science Block Gate'],
      driverId: 'd3'
    }
  ],
  drivers: [
    {
      id: 'd1',
      name: 'Tariq Mahmood',
      cnicMasked: '37405-XXXXXXX-1',
      licenseVerified: true,
      experience: '7 yrs driving',
      policeVerified: true,
      rating: '4.9 ★ (64 rides)',
      safetyNotes: 'Verified background, punctuality score 98%'
    },
    {
      id: 'd2',
      name: 'Kamran Siddiqui',
      cnicMasked: '37405-XXXXXXX-7',
      licenseVerified: true,
      experience: '5 yrs driving',
      policeVerified: true,
      rating: '4.8 ★ (41 rides)',
      safetyNotes: 'Verified background, consistent route updates'
    },
    {
      id: 'd3',
      name: 'Farhan Raza',
      cnicMasked: '37405-XXXXXXX-4',
      licenseVerified: true,
      experience: '4 yrs driving',
      policeVerified: false,
      rating: 'Pending Verification',
      safetyNotes: 'Awaiting police clearance approval in Admin portal'
    }
  ],
  bookings: [
    {
      id: 'b1',
      studentName: 'Ayesha Tariq',
      dept: 'CS • 6th Sem',
      stop: '6th Road Stop',
      routeId: 'r1',
      status: 'On Board'
    },
    {
      id: 'b2',
      studentName: 'Hira Naveed',
      dept: 'BBA • 4th Sem',
      stop: 'Satellite Town Block C',
      routeId: 'r1',
      status: 'Picked Up'
    },
    {
      id: 'b3',
      studentName: 'Zainab Malik',
      dept: 'EE • 8th Sem',
      stop: 'Main Boulevard',
      routeId: 'r1',
      status: 'Scheduled'
    }
  ],
  sosAlerts: []
};

let state = loadPersistedState();
let sosCountdownTimer = null;
let sosSecondsLeft = 0;

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    return { ...JSON.parse(JSON.stringify(DEFAULT_STATE)), ...parsed };
  } catch (err) {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Ignore storage quota errors in restricted browser modes
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const colorMap = {
    info: 'bg-slate-900 text-white border-slate-700',
    success: 'bg-emerald-700 text-white border-emerald-500',
    danger: 'bg-red-700 text-white border-red-500'
  };
  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-2xl border shadow-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${colorMap[type] || colorMap.info}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function togglePitchDemoMode() {
  state.pitchDemoMode = !state.pitchDemoMode;
  persistState();
  renderPitchBanner();
  showToast(state.pitchDemoMode ? 'Pitch Demo Mode enabled.' : 'Pitch Demo Mode set to Standard.', 'info');
}

function renderPitchBanner() {
  const btn = document.getElementById('pitch-mode-toggle');
  const dot = document.getElementById('pitch-mode-indicator');
  const desc = document.getElementById('pitch-mode-desc');
  if (!btn || !dot || !desc) return;

  if (state.pitchDemoMode) {
    btn.textContent = 'Demo Mode: ON';
    btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition';
    dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
    desc.textContent = 'Quick reset & live state enabled for pitch walkthroughs. Saved automatically in localStorage.';
  } else {
    btn.textContent = 'Demo Mode: OFF';
    btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition';
    dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-400';
    desc.textContent = 'Standard interactive mode active. You can still reset demo data anytime below.';
  }
}

function resetDemoState() {
  cancelSOSCountdown();
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  state.lastShareLink = '';
  document.getElementById('sos-active-actions')?.classList.add('hidden');
  document.getElementById('guardian-contact-editor')?.classList.add('hidden');
  document.getElementById('guardian-share-preview')?.classList.add('hidden');
  const statusText = document.getElementById('sos-status-text');
  if (statusText) {
    statusText.textContent =
      'Press once to start a 3-second confirmation before alerting Admin, Guardian & Campus Security.';
  }
  persistState();
  renderAll();
  showToast('Demo data reset to clean initial state.', 'info');
}

function switchRole(role) {
  state.activeRole = role;
  persistState();
  ['student', 'guardian', 'driver', 'admin'].forEach((r) => {
    const btn = document.getElementById(`role-${r}`);
    const view = document.getElementById(`view-${r}`);
    if (!btn || !view) return;
    if (r === role) {
      btn.className = 'role-btn px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 bg-pink-600 text-white shadow-sm shrink-0 relative';
      view.classList.remove('hidden');
    } else {
      btn.className = 'role-btn px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 text-slate-600 hover:text-slate-900 shrink-0 relative';
      view.classList.add('hidden');
    }
  });
  renderAll();
}

function openGuardianLiveView() {
  buildGuardianShareLink();
  switchRole('guardian');
  showToast('Opened Guardian Live Tracking view (no student login required).', 'info');
}

function toggleGuardianContactEditor(forceState) {
  const editor = document.getElementById('guardian-contact-editor');
  if (!editor) return;
  const shouldShow = typeof forceState === 'boolean' ? forceState : editor.classList.contains('hidden');
  if (shouldShow) {
    document.getElementById('input-guardian-name').value = state.guardianName;
    document.getElementById('input-guardian-phone').value = state.guardianPhone;
    editor.classList.remove('hidden');
  } else {
    editor.classList.add('hidden');
  }
}

function saveGuardianContact() {
  const nameVal = document.getElementById('input-guardian-name').value.trim();
  const phoneVal = document.getElementById('input-guardian-phone').value.trim();
  if (!nameVal || !phoneVal) {
    showToast('Please enter both Guardian name and phone/WhatsApp number.', 'danger');
    return;
  }
  state.guardianName = nameVal;
  state.guardianPhone = phoneVal;
  buildGuardianShareLink();
  persistState();
  toggleGuardianContactEditor(false);
  renderGuardianView();
  renderActiveRide();
  showToast('Guardian contact & live link updated.', 'success');
}

function advanceRideProgress() {
  const route = getSelectedRoute();
  const stopCount = Math.max(route.stops.length, 2);
  const stepIncrement = Math.max(15, Math.round(100 / stopCount));
  if (state.rideProgress >= 100) {
    state.rideProgress = 25;
  } else {
    state.rideProgress = Math.min(100, state.rideProgress + stepIncrement);
  }
  state.lastUpdatedLabel = 'Updated just now (live GPS)';
  persistState();
  renderActiveRide();
  renderGuardianView();
  showToast(`Live checkpoint updated (${state.rideProgress}%).`, 'info');
}

function getTripStatusMeta(route) {
  const activeSos = state.sosAlerts.find((a) => a.status === 'Active');
  if (activeSos) {
    return {
      label: 'SOS ALERT ACTIVE',
      pillClass: 'inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full bg-red-100 text-red-800',
      dotClass: 'w-2 h-2 rounded-full bg-red-600 animate-ping',
      etaText: 'Priority Safety Check',
      coords: '33.7489° N, 72.8421° E'
    };
  }
  if (!state.tripActive) {
    return {
      label: 'Trip Paused / Stand-By',
      pillClass: 'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700',
      dotClass: 'w-2 h-2 rounded-full bg-slate-500',
      etaText: 'Scheduled for ' + route.pickupTime,
      coords: '33.7441° N, 72.8365° E'
    };
  }
  if (state.rideProgress >= 100) {
    return {
      label: 'Arrived at Campus / Destination',
      pillClass: 'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800',
      dotClass: 'w-2 h-2 rounded-full bg-indigo-600',
      etaText: 'Arrived safely (0 mins)',
      coords: '33.7518° N, 72.8482° E'
    };
  }
  const etaMins = Math.max(2, Math.round(((100 - state.rideProgress) / 100) * 22));
  return {
    label: 'En Route • Live Tracking',
    pillClass: 'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800',
    dotClass: 'w-2 h-2 rounded-full bg-emerald-600 animate-pulse',
    etaText: `ETA ${etaMins} mins`,
    coords: `33.74${Math.min(9, 5 + Math.floor(state.rideProgress / 20))}° N, 72.84${Math.floor(state.rideProgress / 15)}° E`
  };
}

function buildGuardianShareLink() {
  const route = getSelectedRoute();
  const driver = state.drivers.find((d) => d.id === route.driverId) || state.drivers[0];
  const shareUrl = `https://shesafe.app/track/${route.id}?pass=${encodeURIComponent(state.guardianPasscode)}`;
  state.lastShareLink = `${shareUrl} | Code: ${state.guardianPasscode} | Driver: ${driver.name} (${route.vehiclePlate}) | Progress: ${state.rideProgress}%`;
  persistState();
  return { shareUrl, driver, route };
}

function shareTripWithGuardian() {
  const { shareUrl, driver, route } = buildGuardianShareLink();
  const preview = document.getElementById('guardian-share-preview');
  const shareText = `SheSafe Live Commute Link for ${state.guardianName} (${state.guardianPhone}): ${shareUrl} | Passcode: ${state.guardianPasscode} | ${route.vanCode} (${route.vehiclePlate}) with ${driver.name}.`;
  if (preview) {
    preview.textContent = shareText;
    preview.classList.remove('hidden');
  }
  showToast(`Shared live Guardian tracking link with ${state.guardianName} (${state.guardianPhone}).`, 'success');
}

function copySafetySummary() {
  const { shareUrl, driver, route } = buildGuardianShareLink();
  const textToCopy = `${shareUrl} | Passcode: ${state.guardianPasscode} | ${route.vanCode} (${route.vehiclePlate}) - ${driver.name} (${state.rideProgress}%)`;
  const preview = document.getElementById('guardian-share-preview');
  if (preview) {
    preview.textContent = textToCopy;
    preview.classList.remove('hidden');
  }

  try {
    const tempInput = document.createElement('textarea');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('Guardian link & passcode copied to clipboard.', 'success');
  } catch (err) {
    showToast('Guardian link ready below for copying.', 'info');
  }
}

function renderActiveRide() {
  const route = getSelectedRoute();
  const driver = state.drivers.find((d) => d.id === route.driverId) || state.drivers[0];
  const stopIndex = Math.min(
    route.stops.length - 1,
    Math.floor((state.rideProgress / 100) * route.stops.length)
  );
  const currentStop = route.stops[stopIndex] || route.stops[0];
  const statusMeta = getTripStatusMeta(route);

  const pill = document.getElementById('ride-status-pill');
  if (pill) {
    pill.className = statusMeta.pillClass;
    pill.innerHTML = `<span class="${statusMeta.dotClass}"></span>${statusMeta.label}`;
  }

  const etaEl = document.getElementById('ride-eta-label');
  if (etaEl) etaEl.textContent = statusMeta.etaText;
  const originEl = document.getElementById('ride-origin-label');
  if (originEl) originEl.textContent = `Pickup: ${route.stops[0]}`;
  const destEl = document.getElementById('ride-dest-label');
  if (destEl) destEl.textContent = route.stops[route.stops.length - 1];
  const stopEl = document.getElementById('ride-current-stop');
  if (stopEl) stopEl.textContent = `Current Stop: ${currentStop} (${state.rideProgress}%)`;
  const barEl = document.getElementById('ride-progress-bar');
  if (barEl) barEl.style.width = `${state.rideProgress}%`;
  const vanEl = document.getElementById('active-van-summary');
  if (vanEl) vanEl.textContent = `${route.vanCode} (${route.vehiclePlate}) • ${driver.name}`;
  const guardianDisp = document.getElementById('student-guardian-display');
  if (guardianDisp) guardianDisp.textContent = `${state.guardianName} (${state.guardianPhone})`;
}

function renderGuardianView() {
  const route = getSelectedRoute();
  const driver = state.drivers.find((d) => d.id === route.driverId) || state.drivers[0];
  const stopIndex = Math.min(
    route.stops.length - 1,
    Math.floor((state.rideProgress / 100) * route.stops.length)
  );
  const currentStop = route.stops[stopIndex] || route.stops[0];
  const statusMeta = getTripStatusMeta(route);
  const { shareUrl } = buildGuardianShareLink();

  const titleEl = document.getElementById('guardian-student-title');
  if (titleEl) titleEl.textContent = 'Ayesha Tariq — Live Commute';
  const subEl = document.getElementById('guardian-contact-subtitle');
  if (subEl) subEl.textContent = `Shared with ${state.guardianName} (${state.guardianPhone})`;

  const badge = document.getElementById('guardian-trip-badge');
  if (badge) {
    badge.className = statusMeta.pillClass;
    badge.innerHTML = `<span class="${statusMeta.dotClass}"></span>${statusMeta.label}`;
  }

  const updatedEl = document.getElementById('guardian-last-updated');
  if (updatedEl) updatedEl.textContent = state.lastUpdatedLabel || 'Updated just now';
  const coordsEl = document.getElementById('guardian-coords');
  if (coordsEl) coordsEl.textContent = statusMeta.coords;
  const checkpointEl = document.getElementById('guardian-current-checkpoint');
  if (checkpointEl) checkpointEl.textContent = `${currentStop} (${state.rideProgress}% Complete)`;
  const routeSummaryEl = document.getElementById('guardian-route-summary');
  if (routeSummaryEl) {
    routeSummaryEl.textContent = `${route.name} • Pickup ${route.pickupTime} / Return ${route.returnTime}`;
  }
  const gBarEl = document.getElementById('guardian-progress-bar');
  if (gBarEl) gBarEl.style.width = `${state.rideProgress}%`;
  const gEtaEl = document.getElementById('guardian-eta-text');
  if (gEtaEl) gEtaEl.textContent = `Estimated Arrival: ${statusMeta.etaText}`;

  const driverCardEl = document.getElementById('guardian-driver-card');
  if (driverCardEl) {
    driverCardEl.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-purple-700">Assigned Driver &amp; Vehicle</span>
          <h4 class="text-sm font-extrabold text-slate-900 mt-0.5">${driver.name}</h4>
          <p class="text-xs text-slate-600">${route.vanCode} • Plate: <span class="font-mono font-bold text-slate-800">${route.vehiclePlate}</span> (${route.vehicleModel})</p>
        </div>
        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
          driver.policeVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }">
          ${driver.policeVerified ? 'Police Verified ✓' : 'Verification Pending'}
        </span>
      </div>
      <div class="flex items-center justify-between pt-2 border-t border-purple-200/70 text-[11px] text-slate-600">
        <span>${driver.rating}</span>
        <button type="button" onclick="openDriverModal('${route.id}')" class="font-bold text-purple-700 hover:text-purple-900 underline">
          Full Safety Card
        </button>
      </div>
    `;
  }

  const urlEl = document.getElementById('guardian-access-url');
  if (urlEl) urlEl.textContent = shareUrl;
  const codeEl = document.getElementById('guardian-passcode-badge');
  if (codeEl) codeEl.textContent = state.guardianPasscode;

  const activeSos = state.sosAlerts.find((a) => a.status === 'Active');
  const sosBanner = document.getElementById('guardian-sos-banner');
  const guardianDot = document.getElementById('guardian-sos-dot');
  if (sosBanner && guardianDot) {
    if (activeSos) {
      sosBanner.classList.remove('hidden');
      guardianDot.classList.remove('hidden');
      document.getElementById('guardian-sos-time').textContent = activeSos.timestamp;
      document.getElementById('guardian-sos-message').textContent =
        `${activeSos.studentName} triggered an SOS alert near ${currentStop} on ${activeSos.routeName} (${activeSos.vanCode}).`;
    } else {
      sosBanner.classList.add('hidden');
      guardianDot.classList.add('hidden');
    }
  }
}

function contactEmergency(targetLabel) {
  showToast(`Connecting emergency alert & call to ${targetLabel}...`, 'danger');
}

function getSelectedRoute() {
  return state.routes.find((r) => r.id === state.selectedRouteId) || state.routes[0];
}

function switchStudentTab(tab) {
  state.activeStudentTab = tab;
  persistState();
  ['routes', 'ride', 'pass'].forEach((t) => {
    const btn = document.getElementById(`stab-${t}`);
    const content = document.getElementById(`scontent-${t}`);
    if (!btn || !content) return;
    if (t === tab) {
      btn.className = 'stab-btn py-2 rounded-xl bg-white text-pink-700 shadow-sm transition';
      content.classList.remove('hidden');
    } else {
      btn.className = 'stab-btn py-2 rounded-xl text-white/85 hover:text-white transition';
      content.classList.add('hidden');
    }
  });
  renderStudentBookings();
  renderActiveRide();
}

function setTimeSlotFilter(slot) {
  state.timeSlotFilter = slot;
  persistState();
  ['all', 'Morning', 'Mid-Day', 'Late Lab'].forEach((s) => {
    const btn = document.getElementById(`slot-${s}`);
    if (!btn) return;
    if (s === slot) {
      btn.className = 'slot-btn py-1.5 rounded-xl bg-white text-pink-700 shadow-xs transition';
    } else {
      btn.className = 'slot-btn py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition';
    }
  });
  renderStudentRoutes();
}

function selectRoute(routeId) {
  state.selectedRouteId = routeId;
  persistState();
  renderStudentRoutes();
  renderActiveRide();
  renderGuardianView();
}

function renderStudentRoutes() {
  const listEl = document.getElementById('student-routes-list');
  if (!listEl) return;

  const availFilter = document.getElementById('route-filter')?.value || 'all';
  const filtered = state.routes.filter((r) => {
    const slotMatch = state.timeSlotFilter === 'all' || r.timeSlot === state.timeSlotFilter;
    const availMatch =
      availFilter === 'all' ||
      (availFilter === 'available' && r.seatsAvailable > 0) ||
      (availFilter === 'budget' && r.monthlyFare < 5000);
    return slotMatch && availMatch;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">No vans match this filter. Try switching to All time slots.</div>`;
    return;
  }

  listEl.innerHTML = filtered
    .map((r) => {
      const driver = state.drivers.find((d) => d.id === r.driverId) || state.drivers[0];
      const isSelected = r.id === state.selectedRouteId;
      return `
        <div onclick="selectRoute('${r.id}')" class="cursor-pointer rounded-2xl border p-3.5 transition space-y-2.5 ${
          isSelected ? 'border-pink-500 bg-pink-50/40 shadow-xs' : 'border-slate-200 bg-white hover:border-pink-300'
        }">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">${r.timeSlot} • ${r.pickupTime}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  driver.policeVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }">${driver.policeVerified ? 'Verified Driver' : 'Pending Check'}</span>
              </div>
              <h4 class="text-sm font-extrabold text-slate-900 mt-1">${r.name}</h4>
              <p class="text-[11px] text-slate-500">${r.vanCode} (${r.vehiclePlate}) • ${driver.name}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-extrabold text-pink-700">PKR ${r.monthlyFare.toLocaleString()}</p>
              <p class="text-[10px] font-semibold ${r.seatsAvailable > 0 ? 'text-emerald-700' : 'text-red-600'}">${r.seatsAvailable} seats left</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <button type="button" onclick="openDriverModal('${r.id}', event)" class="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline">
              Driver &amp; Safety Card
            </button>
            <button type="button" onclick="bookRouteSeat('${r.id}', event)" ${
              r.seatsAvailable <= 0 ? 'disabled' : ''
            } class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              r.seatsAvailable > 0
                ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }">
              ${r.seatsAvailable > 0 ? 'Book Monthly Seat' : 'Full'}
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

function bookRouteSeat(routeId, event) {
  if (event) event.stopPropagation();
  const route = state.routes.find((r) => r.id === routeId);
  if (!route || route.seatsAvailable <= 0) return;

  route.seatsAvailable -= 1;
  state.selectedRouteId = route.id;
  state.bookings.unshift({
    id: 'b_' + Date.now(),
    studentName: 'Ayesha Tariq',
    dept: 'CS • 6th Sem',
    stop: route.stops[0],
    routeId: route.id,
    status: 'Subscribed'
  });

  persistState();
  renderAll();
  showToast(`Monthly seat reserved on ${route.name} (PKR ${route.monthlyFare.toLocaleString()}/mo).`, 'success');
}

function renderStudentBookings() {
  const container = document.getElementById('student-bookings-list');
  if (!container) return;

  const myBookings = state.bookings.filter((b) => b.studentName === 'Ayesha Tariq');
  if (myBookings.length === 0) {
    container.innerHTML = `<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">No active monthly passes yet.</div>`;
    return;
  }

  container.innerHTML = myBookings
    .map((b) => {
      const r = state.routes.find((rt) => rt.id === b.routeId) || state.routes[0];
      return `
        <div class="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/70 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-900">${r.name}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">${b.status}</span>
          </div>
          <p class="text-[11px] text-slate-600">${r.vanCode} • Pickup: ${b.stop} (${r.pickupTime})</p>
          <p class="text-xs font-bold text-pink-700">PKR ${r.monthlyFare.toLocaleString()} / month</p>
        </div>
      `;
    })
    .join('');
}

function startSOSCountdown() {
  if (sosCountdownTimer) return;
  sosSecondsLeft = 3;
  const label = document.getElementById('sos-btn-label');
  const cancelBtn = document.getElementById('sos-cancel-btn');
  const statusText = document.getElementById('sos-status-text');

  cancelBtn?.classList.remove('hidden');
  if (label) label.textContent = `CONFIRM SOS IN ${sosSecondsLeft}s...`;
  if (statusText) statusText.textContent = 'Alerting Guardian, Campus Security & Admin console...';

  sosCountdownTimer = setInterval(() => {
    sosSecondsLeft -= 1;
    if (sosSecondsLeft > 0) {
      if (label) label.textContent = `CONFIRM SOS IN ${sosSecondsLeft}s...`;
    } else {
      clearInterval(sosCountdownTimer);
      sosCountdownTimer = null;
      cancelBtn?.classList.add('hidden');
      if (label) label.textContent = 'EMERGENCY SOS ALERT';
      triggerSOSAlert();
    }
  }, 1000);
}

function cancelSOSCountdown() {
  if (sosCountdownTimer) {
    clearInterval(sosCountdownTimer);
    sosCountdownTimer = null;
  }
  sosSecondsLeft = 0;
  document.getElementById('sos-cancel-btn')?.classList.add('hidden');
  const label = document.getElementById('sos-btn-label');
  if (label) label.textContent = 'EMERGENCY SOS ALERT';
  const statusText = document.getElementById('sos-status-text');
  if (statusText) {
    statusText.textContent =
      'SOS countdown cancelled. Press once to start a 3-second confirmation if needed.';
  }
}

function triggerSOSAlert() {
  const route = getSelectedRoute();
  const newAlert = {
    id: 'sos_' + Date.now(),
    studentName: 'Ayesha Tariq',
    routeName: route.name,
    vanCode: route.vanCode,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Active'
  };
  state.sosAlerts.unshift(newAlert);
  persistState();

  document.getElementById('sos-active-actions')?.classList.remove('hidden');
  const statusText = document.getElementById('sos-status-text');
  if (statusText) {
    statusText.textContent = `SOS Active (${newAlert.timestamp}) — Guardian & Campus Security notified.`;
  }
  renderGuardianView();
  renderAdminPortal();
  showToast('EMERGENCY SOS triggered! Guardian & Admin alerted.', 'danger');
}

function resolveSOSAlert(alertId) {
  const target = state.sosAlerts.find((a) => a.id === alertId);
  if (target) target.status = 'Resolved';
  if (!state.sosAlerts.some((a) => a.status === 'Active')) {
    document.getElementById('sos-active-actions')?.classList.add('hidden');
  }
  persistState();
  renderGuardianView();
  renderAdminPortal();
  showToast('SOS alert marked as resolved.', 'success');
}

function toggleDriverTrip() {
  state.tripActive = !state.tripActive;
  state.lastUpdatedLabel = 'Updated just now';
  persistState();
  renderDriverPortal();
  renderActiveRide();
  renderGuardianView();
  showToast(state.tripActive ? 'Live trip started.' : 'Live trip paused.', 'info');
}

function cyclePassengerStatus(bookingId) {
  const order = ['Scheduled', 'Picked Up', 'On Board', 'Dropped'];
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return;
  const nextIdx = (order.indexOf(booking.status) + 1) % order.length;
  booking.status = order[nextIdx];
  persistState();
  renderDriverPortal();
  showToast(`${booking.studentName}: ${booking.status}`, 'info');
}

function renderDriverPortal() {
  const driver = state.drivers[0];
  const badge = document.getElementById('driver-verification-badge');
  if (badge) {
    badge.textContent = driver.policeVerified ? 'Police Verified' : 'Pending Verification';
    badge.className = driver.policeVerified
      ? 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0'
      : 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 shrink-0';
  }

  const pool = state.bookings.reduce((sum, b) => {
    const r = state.routes.find((rt) => rt.id === b.routeId) || state.routes[0];
    return sum + r.monthlyFare;
  }, 0);
  const earningsEl = document.getElementById('driver-monthly-earnings');
  if (earningsEl) earningsEl.textContent = `PKR ${pool.toLocaleString()}`;

  const tripBtn = document.getElementById('driver-trip-toggle');
  const tripSub = document.getElementById('driver-trip-subtext');
  if (tripBtn && tripSub) {
    if (state.tripActive) {
      tripBtn.textContent = 'End Trip';
      tripBtn.className = 'px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shrink-0';
      tripSub.textContent = 'Broadcasting live route status';
    } else {
      tripBtn.textContent = 'Start Trip';
      tripBtn.className = 'px-3 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 transition shrink-0';
      tripSub.textContent = 'Trip currently on stand-by';
    }
  }

  const countBadge = document.getElementById('roster-count-badge');
  if (countBadge) countBadge.textContent = `${state.bookings.length} Riders`;

  const listEl = document.getElementById('driver-passenger-list');
  if (!listEl) return;

  listEl.innerHTML = state.bookings
    .map(
      (b) => `
      <div class="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-2">
        <div>
          <p class="text-xs font-extrabold text-slate-900">${b.studentName}</p>
          <p class="text-[11px] text-slate-500">${b.dept} • ${b.stop}</p>
        </div>
        <button type="button" onclick="cyclePassengerStatus('${b.id}')" class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition shrink-0">
          ${b.status} ↻
        </button>
      </div>
    `
    )
    .join('');
}

function toggleDriverVerification(driverId) {
  const driver = state.drivers.find((d) => d.id === driverId);
  if (!driver) return;
  driver.policeVerified = !driver.policeVerified;
  driver.rating = driver.policeVerified ? '4.8 ★ (Verified)' : 'Pending Verification';
  persistState();
  renderAll();
  showToast(`${driver.name} verification set to ${driver.policeVerified ? 'Verified' : 'Pending'}.`, 'success');
}

function renderAdminPortal() {
  const activeSosList = state.sosAlerts.filter((a) => a.status === 'Active');
  const verifiedCount = state.drivers.filter((d) => d.policeVerified).length;
  const totalSubscriptionsValue = state.bookings.reduce((sum, b) => {
    const r = state.routes.find((rt) => rt.id === b.routeId) || state.routes[0];
    return sum + r.monthlyFare;
  }, 0);
  const platformFee = Math.round(totalSubscriptionsValue * 0.12);

  document.getElementById('kpi-bookings').textContent = String(state.bookings.length);
  document.getElementById('kpi-verified-drivers').textContent = `${verifiedCount} / ${state.drivers.length}`;
  document.getElementById('kpi-revenue').textContent = `PKR ${platformFee.toLocaleString()}`;
  document.getElementById('kpi-sos-count').textContent = String(activeSosList.length);

  const adminBadge = document.getElementById('admin-sos-badge');
  if (adminBadge) {
    adminBadge.classList.toggle('hidden', activeSosList.length === 0);
  }

  const sosEl = document.getElementById('admin-sos-list');
  if (sosEl) {
    if (state.sosAlerts.length === 0) {
      sosEl.innerHTML = `<div class="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 font-medium">No SOS alerts triggered. All routes normal.</div>`;
    } else {
      sosEl.innerHTML = state.sosAlerts
        .map(
          (a) => `
          <div class="p-3 rounded-2xl border ${
            a.status === 'Active' ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'
          } flex items-center justify-between gap-2">
            <div>
              <p class="text-xs font-extrabold text-slate-900">${a.studentName} • ${a.vanCode}</p>
              <p class="text-[11px] text-slate-600">${a.routeName} • ${a.timestamp} (${a.status})</p>
            </div>
            ${
              a.status === 'Active'
                ? `<button type="button" onclick="resolveSOSAlert('${a.id}')" class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white shrink-0">Resolve</button>`
                : `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">Resolved</span>`
            }
          </div>
        `
        )
        .join('');
    }
  }

  const driversEl = document.getElementById('admin-drivers-list');
  if (driversEl) {
    driversEl.innerHTML = state.drivers
      .map(
        (d) => `
        <div class="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-extrabold text-slate-900">${d.name}</p>
            <p class="text-[11px] text-slate-500">CNIC ${d.cnicMasked} • ${d.experience}</p>
          </div>
          <button type="button" onclick="toggleDriverVerification('${d.id}')" class="px-3 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 ${
            d.policeVerified
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }">
            ${d.policeVerified ? 'Verified ✓' : 'Approve'}
          </button>
        </div>
      `
      )
      .join('');
  }
}

function renderAll() {
  renderPitchBanner();
  renderStudentRoutes();
  renderActiveRide();
  renderGuardianView();
  renderStudentBookings();
  renderDriverPortal();
  renderAdminPortal();
}

function openDriverModal(routeId, event) {
  if (event) event.stopPropagation();
  const route = state.routes.find((r) => r.id === routeId);
  if (!route) return;
  const driver = state.drivers.find((d) => d.id === route.driverId) || state.drivers[0];
  state.modalDriverId = route.id;

  document.getElementById('modal-driver-name').textContent = `${driver.name} • ${route.vanCode}`;
  document.getElementById('modal-driver-body').innerHTML = `
    <div class="flex flex-wrap gap-1.5">
      <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
        driver.policeVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
      }">${driver.policeVerified ? 'Police Verified ✓' : 'Verification Pending'}</span>
      <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">${driver.experience}</span>
      <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">${driver.rating}</span>
    </div>
    <div class="rounded-2xl bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs text-slate-700">
      <p><span class="font-bold">Vehicle:</span> ${route.vehicleModel} (Plate: <span class="font-mono font-bold">${route.vehiclePlate}</span>)</p>
      <p><span class="font-bold">CNIC Check:</span> ${driver.cnicMasked}</p>
      <p><span class="font-bold">Schedule:</span> Pickup ${route.pickupTime} • Return ${route.returnTime}</p>
      <p><span class="font-bold">Safety Note:</span> ${driver.safetyNotes}</p>
    </div>
    <div class="flex gap-2">
      <button type="button" onclick="closeDriverModal()" class="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition">
        Close
      </button>
      <button type="button" onclick="selectRoute('${route.id}'); closeDriverModal(); switchStudentTab('ride');" class="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition">
        Track Route
      </button>
    </div>
  `;
  document.getElementById('driver-profile-modal').classList.remove('hidden');
}

function closeDriverModal() {
  document.getElementById('driver-profile-modal')?.classList.add('hidden');
  state.modalDriverId = null;
}

window.addEventListener('DOMContentLoaded', () => {
  switchRole(state.activeRole || 'student');
  switchStudentTab(state.activeStudentTab || 'routes');
  setTimeSlotFilter(state.timeSlotFilter || 'all');
  renderAll();
});