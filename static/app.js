/**
 * BigQuery Release Pulse - Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let releaseNotes = [];
    let activeCategory = 'ALL';
    let searchQuery = '';
    let selectedNote = null;

    // DOM Elements
    const timelineContainer = document.getElementById('timeline-container');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const retryBtn = document.getElementById('retry-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const themeSwitchContainer = document.querySelector('.theme-switch-container');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const categoryPills = document.getElementById('category-pills');

    // Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const modalBadge = document.getElementById('modal-badge');
    const modalDate = document.getElementById('modal-date');
    const modalOriginalText = document.getElementById('modal-original-text');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCounter = document.getElementById('char-counter');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelTweetBtn = document.getElementById('cancel-tweet-btn');
    const submitTweetBtn = document.getElementById('submit-tweet-btn');

    // ==========================================================================
    // Theme Management
    // ==========================================================================
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggleCheckbox.checked = (savedTheme === 'light');
    };

    themeToggleCheckbox.addEventListener('change', () => {
        const newTheme = themeToggleCheckbox.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Add a micro-animation class on toggle
        themeSwitchContainer.classList.add('rotating');
        setTimeout(() => themeSwitchContainer.classList.remove('rotating'), 500);
    });

    // ==========================================================================
    // Fetch Data
    // ==========================================================================
    const fetchReleaseNotes = async () => {
        showLoading(true);
        showError(false);
        showEmpty(false);
        
        try {
            const response = await fetch('/api/release-notes');
            const data = await response.json();
            
            if (data.success && Array.isArray(data.notes)) {
                releaseNotes = data.notes;
                renderFeed();
            } else {
                throw new Error(data.error || 'Failed to fetch release notes.');
            }
        } catch (error) {
            console.error('Error fetching release notes:', error);
            errorMessage.textContent = error.message || 'Unable to connect to the feed. Please try again.';
            showError(true);
            timelineContainer.innerHTML = '';
        } finally {
            showLoading(false);
        }
    };

    // ==========================================================================
    // UI State Helpers
    // ==========================================================================
    const showLoading = (isLoading) => {
        if (isLoading) {
            loadingState.style.display = 'block';
            refreshBtn.classList.add('loading');
            refreshBtn.disabled = true;
        } else {
            loadingState.style.display = 'none';
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }
    };

    const showError = (isError) => {
        errorState.style.display = isError ? 'block' : 'none';
        if (isError) timelineContainer.style.display = 'none';
        else timelineContainer.style.display = 'block';
    };

    const showEmpty = (isEmpty) => {
        emptyState.style.display = isEmpty ? 'block' : 'none';
    };

    // Helper to strip HTML tags for preview and tweet text
    const stripHtml = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Strip out links in text representation to keep it clean
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    // ==========================================================================
    // Rendering Logic
    // ==========================================================================
    const renderFeed = () => {
        // Filter and search
        const filteredNotes = releaseNotes.filter(note => {
            const matchesCategory = activeCategory === 'ALL' || note.category.toLowerCase() === activeCategory.toLowerCase();
            
            const rawContent = stripHtml(note.content).toLowerCase();
            const rawTitle = note.date.toLowerCase();
            const rawCat = note.category.toLowerCase();
            const query = searchQuery.toLowerCase();
            
            const matchesSearch = rawContent.includes(query) || rawTitle.includes(query) || rawCat.includes(query);
            
            return matchesCategory && matchesSearch;
        });

        if (filteredNotes.length === 0) {
            timelineContainer.innerHTML = '';
            showEmpty(true);
            return;
        }

        showEmpty(false);

        // Group notes by date
        const groupedNotes = {};
        filteredNotes.forEach(note => {
            if (!groupedNotes[note.date]) {
                groupedNotes[note.date] = [];
            }
            groupedNotes[note.date].push(note);
        });

        // Generate HTML
        let html = '';
        for (const date in groupedNotes) {
            html += `
                <div class="timeline-group">
                    <div class="timeline-date-header">
                        <div class="timeline-date-bullet"></div>
                        <h2 class="timeline-date-title">${date}</h2>
                    </div>
                    <div class="timeline-cards-list">
                        ${groupedNotes[date].map(note => renderCard(note)).join('')}
                    </div>
                </div>
            `;
        }

        timelineContainer.innerHTML = html;

        // Re-attach event listeners to Tweet buttons
        document.querySelectorAll('.btn-tweet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteId = e.currentTarget.getAttribute('data-id');
                const note = releaseNotes.find(n => n.id === noteId);
                if (note) openTweetModal(note);
            });
        });

        // Re-attach event listeners to Copy buttons
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const noteId = button.getAttribute('data-id');
                const note = releaseNotes.find(n => n.id === noteId);
                if (note) {
                    const plainText = stripHtml(note.content).trim();
                    const textToCopy = `🚀 BigQuery Update (${note.date}): [${note.category.toUpperCase()}]\n\n${plainText}\n\nDetails: ${note.link || 'https://cloud.google.com/bigquery'}`;
                    
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        const textSpan = button.querySelector('.copy-btn-text');
                        const originalText = textSpan.textContent;
                        button.classList.add('copied');
                        textSpan.textContent = 'Copied!';
                        
                        setTimeout(() => {
                            button.classList.remove('copied');
                            textSpan.textContent = originalText;
                        }, 2000);
                    }).catch(err => {
                        console.error('Could not copy text: ', err);
                    });
                }
            });
        });
    };

    const renderCard = (note) => {
        const catClass = note.category.toLowerCase();
        
        // Clean display of description
        return `
            <div class="release-note-card" id="card-${note.id}">
                <div class="card-meta">
                    <span class="badge ${catClass}">${note.category}</span>
                    <div class="card-actions">
                        ${note.link ? `
                            <a href="${note.link}" target="_blank" class="btn-icon-text btn-docs" title="View official Google Cloud documentation">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                                </svg>
                                <span>Docs</span>
                            </a>
                        ` : ''}
                        <button class="btn-icon-text btn-copy" data-id="${note.id}" title="Copy description to clipboard">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span class="copy-btn-text">Copy</span>
                        </button>
                        <button class="btn-icon-text btn-tweet" data-id="${note.id}" title="Share this update on Twitter / X">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    ${note.content}
                </div>
            </div>
        `;
    };

    // ==========================================================================
    // Search and Filters Event Handlers
    // ==========================================================================
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        renderFeed();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
        renderFeed();
    });

    categoryPills.addEventListener('click', (e) => {
        const target = e.target.closest('.pill');
        if (!target) return;

        // Update active class
        document.querySelectorAll('.filter-pills .pill').forEach(pill => pill.classList.remove('active'));
        target.classList.add('active');

        activeCategory = target.getAttribute('data-category');
        renderFeed();
    });

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        activeCategory = 'ALL';
        
        document.querySelectorAll('.filter-pills .pill').forEach(pill => {
            if (pill.getAttribute('data-category') === 'ALL') pill.classList.add('active');
            else pill.classList.remove('active');
        });
        
        renderFeed();
    });

    // Refresh & Retry
    refreshBtn.addEventListener('click', fetchReleaseNotes);
    retryBtn.addEventListener('click', fetchReleaseNotes);

    // ==========================================================================
    // Twitter Sharing Flow (Modal)
    // ==========================================================================
    const openTweetModal = (note) => {
        selectedNote = note;
        
        // Populate static details in modal
        modalBadge.className = `preview-badge badge ${note.category.toLowerCase()}`;
        modalBadge.textContent = note.category;
        modalDate.textContent = note.date;
        
        const plainText = stripHtml(note.content).trim();
        modalOriginalText.textContent = plainText;

        // Construct default tweet text
        // Limit description snippet to fit within 280 character Twitter constraint
        const header = `🚀 BigQuery Update (${note.date}): [${note.category.toUpperCase()}]\n\n`;
        const footer = `\n\n#BigQuery #GoogleCloud\nDetails: ${note.link || 'https://cloud.google.com/bigquery'}`;
        
        const availableChars = 280 - header.length - footer.length;
        let snippet = plainText;
        if (plainText.length > availableChars) {
            snippet = plainText.substring(0, availableChars - 3) + '...';
        }
        
        tweetTextarea.value = `${header}${snippet}${footer}`;
        
        updateCharCounter();
        
        // Show modal
        tweetModal.style.display = 'flex';
        tweetModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Disable page scrolling
        tweetTextarea.focus();
    };

    const closeTweetModal = () => {
        tweetModal.style.display = 'none';
        tweetModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto'; // Re-enable page scrolling
        selectedNote = null;
    };

    const updateCharCounter = () => {
        const len = tweetTextarea.value.length;
        charCounter.textContent = `${len} / 280`;
        
        if (len > 280) {
            charCounter.classList.add('warning');
            submitTweetBtn.disabled = true;
            submitTweetBtn.style.opacity = 0.5;
        } else {
            charCounter.classList.remove('warning');
            submitTweetBtn.disabled = false;
            submitTweetBtn.style.opacity = 1;
        }
    };

    tweetTextarea.addEventListener('input', updateCharCounter);
    
    closeModalBtn.addEventListener('click', closeTweetModal);
    cancelTweetBtn.addEventListener('click', closeTweetModal);
    
    // Close modal on clicking overlay
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) closeTweetModal();
    });

    submitTweetBtn.addEventListener('click', () => {
        const text = tweetTextarea.value;
        if (text.length <= 280) {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(twitterUrl, '_blank', 'width=550,height=420');
            closeTweetModal();
        }
    });

    // ==========================================================================
    // Export to CSV Flow
    // ==========================================================================
    const getFilteredNotesList = () => {
        return releaseNotes.filter(note => {
            const matchesCategory = activeCategory === 'ALL' || note.category.toLowerCase() === activeCategory.toLowerCase();
            
            const rawContent = stripHtml(note.content).toLowerCase();
            const rawTitle = note.date.toLowerCase();
            const rawCat = note.category.toLowerCase();
            const query = searchQuery.toLowerCase();
            
            const matchesSearch = rawContent.includes(query) || rawTitle.includes(query) || rawCat.includes(query);
            
            return matchesCategory && matchesSearch;
        });
    };

    const exportToCSV = () => {
        const filtered = getFilteredNotesList();
        if (filtered.length === 0) return;
        
        const headers = ['Date', 'Category', 'Description', 'Link'];
        const rows = filtered.map(note => [
            note.date,
            note.category,
            stripHtml(note.content).trim().replace(/\s+/g, ' ').replace(/"/g, '""'), // escape quotes and clean whitespace
            note.link || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(val => `"${val}"`).join(','))
        ].join('\r\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bigquery_release_notes_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    exportCsvBtn.addEventListener('click', exportToCSV);

    // ==========================================================================
    // Initial Setup
    // ==========================================================================
    initTheme();
    fetchReleaseNotes();
});
