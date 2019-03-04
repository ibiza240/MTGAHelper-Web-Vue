const ThemeHelper = function () {
    const preloadTheme = (href) => {
        let link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);

        return new Promise((resolve, reject) => {
            link.onload = e => {
                const sheet = e.target.sheet;
                sheet.disabled = true;
                resolve(sheet);
            };
            link.onerror = reject;
        });
    };

    const selectTheme = (themes, name) => {
        //if (name && !themes[name]) {
        //    throw new Error(`"${name}" has not been defined as a theme.`);
        //}
        Object.keys(themes).forEach(n => themes[n].disabled = (n !== name));
    };

    let themes = {};

    return {
        add(name, href) { return preloadTheme(href).then(s => themes[name] = s); },
        set theme(name) { selectTheme(themes, name); },
        get theme() { return Object.keys(themes).find(n => !themes[n].disabled); }
    };
};

var vueApp = new Vue({
    el: '#vueApp',
    data: {
        isAppLoaded: false,
        themes: {
            light: "css/bulma.min.css",
            dark: "css/bulma-dark.min.css"
        },
        themeHelper: new ThemeHelper(),
        themeIsDark: false,
        themeIsDarkInitial: false,

        iconLand: 'https://c-4tvylwolbz88x24nhtlwlkphx2ejbyzljkux2ejvt.g00.gamepedia.com/g00/3_c-4tan.nhtlwlkph.jvt_/c-4TVYLWOLBZ88x24oaawzx3ax2fx2fnhtlwlkph.jbyzljku.jvtx2ftanzhschapvu_nhtlwlkphx2f0x2f04x2fShuk_zftivs.zcnx3fclyzpvux3dj4691m071m4544409k709i17hj9k41j1x26p87j.thyrx3dpthnl_$/$/$/$/$',

        mouseX: 0,
        mouseY: 0,
        showUploadCollectionModal: false,
        showLoginModal: false,

        loginUserId: '',

        lotsOfDecks: 200,

        //loginWithUserId: '',

        currentPage: 'publicDecks',
        currentPageCollection: 'currently',
        currentPageProfile: 'scrapers',

        loading: [],
        scraperIdLoading: '',

        modelCardSelectedUrl: '',
        contactMessage: '',

        modelChangelog: [],

        modelDeckSelected: {
            id: '',
            cardsMain: [],
            cardsSideboard: []
        },

        modelDecks: {
            filters: {
                scraperTypeId: '(All)',
                name: '',
                color: '',
                date: '',
                missingWeight: '',
                showUntracked: false
            },
            decks: []
        },
        //Array of: { priorityFactor, wildcardsMissingMain, wildcardsMissingSideboard, ... }
        modelDecksFiltered: [],

        modelUser: {
            id: '',
            nbLogin: 0,
            changesSinceLastLogin: false,
            collection: {
                collectionDate: 'Unknown',
                cards: [],
                mtgaUserProfile: {}
            },
            decks: [],
            scrapers: [
                {
                    //type: '',
                    //searchByUser: '',
                    //bySection: [
                    //    { ScraperDto }
                    //],
                    //byUser: [
                    //    { ScraperDto }
                    //]
                }
            ],
            weights: {},
            weightsProposed: {
                Mythic: 0,
                RareLand: 0,
                RareNonLand: 0,
                Uncommon: 0,
                Common: 0
            },
            notificationsInactive: []
        },

        modelUserHistory: [],
        modelUserHistorySelected: {},

        modelUserDeck: {
            name: '',
            url: '',
            mtgaFormat: ''
        },

        modelDashboard: {
            summary: [],
            details: [],
            detailsFiltered: [],

            detailsFilters: {
                sets: ['', 'XLN', 'RIX', 'DOM', 'M19', 'GRN', 'RNA'],
                rarities: ['', 'Mythic', 'RareLand', 'RareNonLand', 'Uncommon', 'Common'],

                set: '',
                rarity: ''
            }
        },

        modelDetailsCardSelected: {
            card: '',
            decks: []
        },

        modalData: null
    },
    created: function () {
        let added = Object.keys(this.themes).map(name => {
            return this.themeHelper.add(name, this.themes[name]);
        });

        Promise.all(added).then(sheets => {
            this.themeIsDark = vueApp.themeIsDarkInitial;
            this.themeHelper.theme = this.themeIsDark ? 'dark' : 'light';
            document.getElementById("divInitialLoader").classList.remove("is-active");
        });
    },
    mounted: function () {
        this.registerUser();
    },
    methods: {
        callForChangelogAttention() {
            var element = document.getElementById('iconChangelog');
            element.classList.remove('start-now');
            element.classList.add('pulse');
            setTimeout(function () {
                //element.offsetWidth = element.offsetWidth;
                element.classList.add('start-now');
            }, 10);
        },
        formatSetToFullName(set) {
            switch (set) {
                case 'RNA':
                    return 'Ravnica Allegiance';
                case 'GRN':
                    return 'Guilds of Ravnica';
                case 'M19':
                    return 'Core Set 2019';
                case 'DOM':
                    return 'Dominaria';
                case 'RIX':
                    return 'Rivals of Ixalan';
                case 'XLN':
                    return 'Ixalan';
            }

            return set;
        },
        loadPage(pageName) {
            if (this.currentPage === pageName)
                return;

            this.currentPage = pageName;
        },
        loadData(key, isLoading) {
            var elems = [];

            this.loading
                .filter(i => isLoading || key !== i)
                .forEach(i => elems.push(i));

            if (isLoading) {
                elems.push(key);
            }

            this.loading = elems;
        },
        getClassIsLoadingData(key) {
            if (this.isLoadingData(key))
                return {
                    'is-loading': true
                };

            return '';
        },
        isLoadingData(key) {
            return this.loading.indexOf(key) >= 0;
        },
        isLoadingLotsOfDecks() {
            return this.modelDecks.decks.length >= this.lotsOfDecks && this.loading.indexOf('decks') >= 0;
        },
        isNotificationActive(key) {
            return this.modelUser.notificationsInactive.indexOf(key) < 0;
        },
        showCard(imageUrl) {
            if (imageUrl === null) {
                this.modelCardSelectedUrl = '';
            }
            else {
                ////this.modelCardSelectedUrl = 'https://img.scryfall.com/cards/normal/en/' + c.set.toLowerCase() + '/' + c.setId + '.jpg'

                //if (name === 'Plains')
                //    this.modelCardSelectedUrl = 'https://cdn1.mtggoldfish.com/images/gf/Plains%2B%255BRIX%255D.jpg';
                //else if (name === 'Island')
                //    this.modelCardSelectedUrl = 'https://cdn1.mtggoldfish.com/images/gf/Island%2B%255BRIX%255D.jpg';
                //else if (name === 'Swamp')
                //    this.modelCardSelectedUrl = 'https://cdn1.mtggoldfish.com/images/gf/Swamp%2B%255BRIX%255D.jpg';
                //else if (name === 'Mountain')
                //    this.modelCardSelectedUrl = 'https://cdn1.mtggoldfish.com/images/gf/Mountain%2B%255BRIX%255D.jpg';
                //else if (name === 'Forest')
                //    this.modelCardSelectedUrl = 'https://cdn1.mtggoldfish.com/images/gf/Forest%2B%255BRIX%255D.jpg';
                //else {
                //    if (name.endsWith('Guildgate (a)') || name.endsWith('Guildgate (b)')) {
                //        name = name.replace('(a)', '%253C' + setId + '%253E').replace('(b)', '%253C' + setId + '%253E');
                //    }
                //    else if (name.endsWith('Guildgate')) {
                //        name = name + ' ' + '%253C' + setId + '%253E';
                //    }

                //    this.modelCardSelectedUrl = 'https://cdn1.mtggoldfish.com/images/gf/' + name
                //        .replace(/ /g, '%2B')
                //        .replace(/'/g, '%2527')
                //        .replace(/,/g, '%252C')
                //        .replace(/\//g, '%252F')
                //        + '%2B%255B' + set + '%255D.jpg';
                //}

                //this.$nextTick(/*debounce(*/function () {
                //    var div = document.getElementById('divCardImg');
                //    var l = (vueApp.mouseX - 333);
                //    if (l < 0) l += 500;
                //    if (div !== null) {
                //        div.style.left = l + 'px';
                //        div.style.top = (vueApp.mouseY - 160) + 'px';
                //    }
                //}/*, 200)*/);

                this.modelCardSelectedUrl = 'https://img.scryfall.com/cards' + imageUrl;

                this.$nextTick(function () {
                    var div = document.getElementById('divCardImg');
                    var l = (vueApp.mouseX - 333);
                    if (l < 0) l += 500;
                    if (div !== null) {
                        div.style.left = l + 'px';
                        div.style.top = (vueApp.mouseY - 160) + 'px';
                    }
                });
            }
        },
        tryToLoginWithUserId() {
            sendAjaxGet('/api/User/FromUserId?id=' + this.loginUserId, function (statuscode, body) {
                var data = JSON.parse(body);

                if (statuscode === 200) {
                    vueApp.showLoginModal = false;
                    vueApp.registerUser();
                }
                else {
                    alert(data.error);
                }
            });
        },
        getTotalWildcards() {

            var totalWildcards = vueApp.modelUser.collection.mtgaUserProfile.wildcards.Mythic +
                vueApp.modelUser.collection.mtgaUserProfile.wildcards.Rare +
                vueApp.modelUser.collection.mtgaUserProfile.wildcards.Uncommon +
                vueApp.modelUser.collection.mtgaUserProfile.wildcards.Common;
            return totalWildcards;
        },
        calculateWeightsProposed() {
            // Calculate weightsProposed
            var divider = 840;
            var totalWildcards = this.getTotalWildcards();
            var weightsProposed = {
                Mythic: (divider / (vueApp.modelUser.collection.mtgaUserProfile.wildcards.Mythic / totalWildcards) / 100).toFixed(1),
                RareLand: (divider / (vueApp.modelUser.collection.mtgaUserProfile.wildcards.Rare / totalWildcards) / 100).toFixed(1),
                RareNonLand: (divider / (vueApp.modelUser.collection.mtgaUserProfile.wildcards.Rare / totalWildcards) / 100).toFixed(1),
                Uncommon: (divider / (vueApp.modelUser.collection.mtgaUserProfile.wildcards.Uncommon / totalWildcards) / 100).toFixed(1),
                Common: (divider / (vueApp.modelUser.collection.mtgaUserProfile.wildcards.Common / totalWildcards) / 100).toFixed(1)
            };
            vueApp.modelUser.weightsProposed = weightsProposed;
        },
        registerUser() {
            sendAjaxGet('/api/User/Register', function (statuscode, body) {
                var data = JSON.parse(body);
                vueApp.modelUser.id = data.userId;
                vueApp.modelUser.nbLogin = data.nbLogin;
                vueApp.modelUser.changesSinceLastLogin = data.changesSinceLastLogin;
                vueApp.modelUser.notificationsInactive = data.notificationsInactive;

                vueApp.refreshAll(true, true);

                sendAjaxGet('/api/User/Theme', function (statuscode, body) {
                    var data = JSON.parse(body);
                    if (statuscode === 200) {
                        vueApp.themeIsDarkInitial = data.status === 'true';
                        vueApp.themeIsDark = vueApp.themeIsDarkInitial;
                    }
                    else {
                        alert(data.error);
                    }
                });

                sendAjaxGet('/api/Misc/Changelog', function (statuscode, body) {
                    vueApp.modelChangelog = JSON.parse(body);
                });

                if (vueApp.modelUser.changesSinceLastLogin) {
                    setTimeout(vueApp.callForChangelogAttention, 10000);
                }
            });
        },
        refreshAll(refreshCollection, dynamicLanding) {
            this.refreshDecks();
            this.refreshDashboard();

            if (refreshCollection) {
                this.loadData('collectionGet', true);
                this.isAppLoaded = true;
                sendAjaxGet('/api/User/Collection', (statuscode, body) => {
                    vueApp.loadData('collectionGet', false);
                    vueApp.modelUser.collection = JSON.parse(body);

                    if (this.getTotalWildcards() > 0) {
                        vueApp.calculateWeightsProposed();
                    }

                    if (dynamicLanding && vueApp.modelUser.collection.cards.length === 0)
                        vueApp.currentPage = 'privateCollection';

                    vueApp.refreshUserHistory();
                });
            }

            this.refreshUserDecks();
            this.refreshUserScrapers();
            this.refreshUserWeights();
        },
        refreshUserHistory() {
            this.loadData('userHistory', true);
            sendAjaxGet('/api/User/History/NewCards', (statuscode, body) => {
                vueApp.modelUserHistory = JSON.parse(body).history;
                vueApp.loadData('userHistory', false);
            });
        },
        refreshDecks: debounce(function () {
            this.loadData('decks', true);
            sendAjaxGet('/api/Decks', (statuscode, body) => {
                vueApp.modelDecks.decks = JSON.parse(body).decks;
                vueApp.filterDecks();
                vueApp.loadData('decks', false);
            });
        }),
        refreshUserDecks() {
            this.loadData('userdecksGet', true);
            sendAjaxGet('/api/User/CustomDecks', (statuscode, body) => {
                vueApp.modelUser.decks = JSON.parse(body).decks;
                vueApp.filterDecks();
                vueApp.loadData('userdecksGet', false);
            });
        },
        refreshUserScrapers() {
            //this.loadData('userscrapersGet', true);
            //sendAjaxGet('/api/User/Scrapers', (statuscode, body) => {
            //    vueApp.$set(this.modelUser, 'scrapers', JSON.parse(body).scrapersByType);

            //    if (vueApp.isLoadingData('userScraperAsync')) {
            //        if (vueApp.modelUser.scrapers.map(i => i.id).indexOf('streamdecker-' + vueApp.modelUserScrapers.streamdecker) >= 0) {
            //            vueApp.modelUserScrapers.streamdecker = '';
            //            vueApp.loadData('userScraperAsync', false);

            //            vueApp.refreshDecks();
            //            vueApp.refreshUserScrapers();
            //            vueApp.refreshDashboard();
            //        }
            //    }
            //    else {
            //        vueApp.filterDecks();
            //    }

            //    vueApp.loadData('userscrapersGet', false);
            //});
            this.loadData('userscrapersGet', true);
            sendAjaxGet('/api/User/Scrapers', (statuscode, body) => {
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    var scrapersByType = data.scrapersByType
                        .groupBy('type')
                        .map(i => {
                            return {
                                type: i.key,
                                searchByUser: '',
                                bySection: i.values.filter(x => { return x.isByUser === false }),
                                byUser: i.values.filter(x => { return x.isByUser === true })
                            };
                        });

                    vueApp.$set(this.modelUser, 'scrapers', scrapersByType);
                }
                else {
                    alert(data.error);
                }

                //if (vueApp.isLoadingData('userScraperAsync')) {
                //    //if (vueApp.modelUser.scrapers.map(i => i.id).indexOf('streamdecker-' + vueApp.modelUserScrapers.streamdecker) >= 0) {
                //    if (vueApp.getScrapersFlattened().indexOf(vueApp.scraperIdLoading) >= 0) {
                //        vueApp.scraperIdLoading = '';
                //        vueApp.loadData('userScraperAsync', false);

                //        vueApp.refreshDecks();
                //        vueApp.refreshUserScrapers();
                //        vueApp.refreshDashboard();
                //    }
                //}
                //else {
                vueApp.filterDecks();
                //}

                vueApp.loadData('userscrapersGet', false);
            });
        },
        refreshUserWeights() {
            vueApp.loadData('getWeights', true);
            sendAjaxGet('/api/User/Weights', (statuscode, body) => {
                vueApp.loadData('getWeights', false);
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    vueApp.modelUser.weights = data.weights;
                }
                else {
                    alert(data.error);
                }
            });
        },
        refreshDashboard() {
            this.loadData('dashboard', true);
            sendAjaxGet('/api/Dashboard', (statuscode, body) => {
                if (statuscode === 200) {
                    var data = JSON.parse(body);
                    vueApp.modelDashboard.details = data.details;
                    vueApp.modelDashboard.summary = data.summary;
                    vueApp.filterDashboardDetails();
                    vueApp.loadData('dashboard', false);
                }
            });
        },
        filterDecks() {
            var scraperTypeId = this.modelDecks.filters.scraperTypeId;
            var name = this.modelDecks.filters.name.trim();
            var color = this.modelDecks.filters.color.trim().toUpperCase();
            var date = this.modelDecks.filters.date.trim();
            var weight = this.modelDecks.filters.missingWeight;
            var showUntracked = this.modelDecks.filters.showUntracked;

            var filtered = [];

            function isDateInRange(dateCreated) {
                if (date.startsWith('>')) {
                    var dateStart = date.slice(1).trim();
                    return moment(dateCreated) > moment(dateStart);
                }

                return false;
            }

            function isWeightInRange(deckWeight) {
                if (weight.startsWith('>'))
                    return deckWeight > weight.slice(1).trim();
                else if (weight.startsWith('<'))
                    return deckWeight < weight.slice(1).trim();

                return false;
            }

            this.modelDecks.decks
                .forEach(i => {
                    var f = true;

                    var fSourceFound = i.scraperTypeId !== null && scraperTypeId !== null && i.scraperTypeId.toLowerCase().indexOf(scraperTypeId.toLowerCase()) >= 0;
                    var fSourceUnknown = scraperTypeId !== '' || i.scraperTypeId === '';
                    var fSourceNull = i.scraperTypeId === null && scraperTypeId === null;
                    f &= scraperTypeId === '(All)' || (fSourceFound && fSourceUnknown) || fSourceNull;

                    f &= name === '' || i.name.toLowerCase().indexOf(name.toLowerCase()) >= 0;
                    f &= color === '' || i.color === color;
                    f &= date === '' || i.dateCreated.substring(0, 10) === date || isDateInRange(i.dateCreated);
                    f &= weight === '' || isWeightInRange(i.missingWeight);
                    f &= i.priorityFactor > 0 || showUntracked;

                    if (f) filtered.push(clone(i));
                });

            this.modelDecksFiltered = filtered;
        },
        decksAreFiltered() {
            return this.modelDecks.filters.scraperTypeId !== '(All)'
                || this.modelDecks.filters.name !== ''
                || this.modelDecks.filters.color !== ''
                || this.modelDecks.filters.date !== ''
                || this.modelDecks.filters.missingWeight !== ''
                || this.modelDecks.filters.showUntracked;
        },
        clearFiltersDecks() {
            this.modelDecks.filters.scraperTypeId = '(All)';
            this.modelDecks.filters.name = '';
            this.modelDecks.filters.color = '';
            this.modelDecks.filters.date = '';
            this.modelDecks.filters.missingWeight = '';
            this.modelDecks.filters.showUntracked = false;
            this.filterDecks();
        },
        displayTotalCards(isSideboard) {
            var nb = 0;
            if (isSideboard) {
                if (typeof (this.modelDeckSelected.cardsSideboard) !== 'undefined') {
                    nb = this.modelDeckSelected.cardsSideboard.reduce((a, b) => a += b.amount, 0);
                }

                return 'Sideboard (' + nb + ' cards)';
            }
            else {
                nb = this.modelDeckSelected.cardsMain.reduce((a, b) => a += b.amount, 0);
                var nbLands = this.modelDeckSelected.cardsMain
                    .filter((i) => i.type === 'Land')
                    .reduce((a, b) => a += b.amount, 0);
                return 'Main (' + nb + ' cards, ' + nbLands + ' lands)';
            }
        },
        setDeckPriorityFactor(deckId, priorityFactor) {
            var p = parseFloat(priorityFactor);
            if (isNaN(p) || p < 0) {
                alert("Priority factor value is invalid");
                return;
            }

            if (p === 0) {
                this.stopTracking(deckId);
                return;
            }

            var idxFiltered = findWithAttr(this.modelDecksFiltered, 'id', deckId);
            this.$set(this.modelDecksFiltered[idxFiltered], 'priorityFactor', p);
            this.$set(this.modelDecksFiltered[idxFiltered], 'missingWeight', this.modelDecksFiltered[idxFiltered].missingWeightBase * this.modelDecksFiltered[idxFiltered].priorityFactor);

            this.loadData('dashboard', true);
            sendAjaxPatch('/api/User/DeckPriorityFactor', { DeckId: deckId, Value: p }, null, (statuscode, body) => {
                vueApp.refreshDashboard();
            });
        },
        stopTracking(deckId) {
            var idx = findWithAttr(this.modelDecks.decks, 'id', deckId);
            this.modelDecks.decks[idx].priorityFactor = 0;

            var idxFiltered = findWithAttr(this.modelDecksFiltered, 'id', deckId);
            this.$set(this.modelDecksFiltered[idxFiltered], 'priorityFactor', 0);

            this.loadData('dashboard', true);
            sendAjaxPatch('/api/User/DeckPriorityFactor', { DeckId: deckId, Value: 0 }, null, (statuscode, body) => {
                vueApp.refreshDashboard();
            });

            if (this.modelDecks.filters.showUntracked) {
                // Still preserve item in filtered list for display
            }
            else {
                this.modelDecksFiltered.splice(idxFiltered, 1);

                if (this.modelDeckSelected.id === deckId) {
                    this.clearSelectedDeck();
                }
                //else {

                //}
            }
        },
        resetDecksPriorityFactor(value) {
            this.loadData('decks', true);
            this.loadData('dashboard', true);
            sendAjaxPatch('/api/User/DeckPriorityFactor/ResetAll', { Value: value }, null, (statuscode, body) => {
                vueApp.refreshDecks();
                vueApp.refreshDashboard();
            });
        },
        trackFilteredDecks(doTrack) {
            this.loadData('decks', true);
            this.loadData('dashboard', true);
            var decks = this.modelDecksFiltered.map((d) => d.id);
            sendAjaxPatch('/api/User/DeckPriorityFactor/FilteredDecks', { DoTrack: doTrack, Decks: decks }, null, (statuscode, body) => {
                vueApp.refreshDecks();
                vueApp.refreshDashboard();
            });
        },
        getDeck(deckId) {
            if (this.modelDeckSelected.id === deckId)
                return;

            this.modelDeckSelected.id = deckId;
            this.loadData('deck', true);

            sendAjaxGet('/api/Decks/' + deckId, function (statuscode, body) {
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    vueApp.modelDeckSelected = data.deck;
                    vueApp.loadData('deck', false);
                }
                else {
                    alert(data.error);
                }
            });
        },
        clearSelectedDeck() {
            this.modelDeckSelected = {
                id: '',
                cardsMain: [],
                cardsSideboard: []
            };
        },
        filterDashboardDetails() {
            var set = this.modelDashboard.detailsFilters.set;
            var rarity = this.modelDashboard.detailsFilters.rarity;

            var filtered = [];

            this.modelDashboard.details
                .forEach(i => {
                    var f = true;
                    f &= set === '' || i.set === set;
                    f &= rarity === '' || i.rarity === rarity;

                    if (f) filtered.push(i);
                });

            this.modelDashboard.detailsFiltered = filtered;
            //this.modelDashboard = {
            //    summary: this.modelDashboard.summary,
            //    details: this.modelDashboard.details,
            //    detailsFiltered: filtered
            //};
            this.$forceUpdate();
        },
        dashboardDetailsAreFiltered() {
            return this.modelDashboard.detailsFilters.rarity !== ''
                || this.modelDashboard.detailsFilters.set !== '';
        },
        clearFiltersDashboardDetails() {
            this.modelDashboard.detailsFilters.rarity = '';
            this.modelDashboard.detailsFilters.set = '';
            this.filterDashboardDetails();
        },
        getDecksForCard(card) {
            this.modelDetailsCardSelected.card = card;
            this.loadData('dashboardDetailsCardUsedIn', true);
            sendAjaxGet('/api/Dashboard/DecksByCard?card=' + card, function (statuscode, body) {
                vueApp.loadData('dashboardDetailsCardUsedIn', false);
                vueApp.$set(vueApp.modelDetailsCardSelected, 'decks', JSON.parse(body).infoByDeck);
            });
        },
        openDashboardDetails(set, rarity) {
            this.modelDashboard.detailsFilters.set = set;
            this.modelDashboard.detailsFilters.rarity = rarity;

            this.filterDashboardDetails();

            this.currentPage = 'privateDashboardDetails';
        },
        goToDeck(deckId, deckName) {
            this.clearFiltersDecks();
            this.modelDecks.filters.name = deckName;
            this.modelDecks.filters.showUntracked = true;
            this.filterDecks();

            this.currentPage = 'publicDecks';
            this.getDeck(deckId);
        },
        getDeckFromUrl() {
            var url = this.modelUserDeck.url.toLowerCase();
            if (url.startsWith('https://aetherhub.com/deck/public') ||
                url.startsWith('https://www.mtggoldfish.com/deck')) {
                this.loadData('userDeckFromUrl', true);

                sendAjaxPost('/api/Decks/FromUrl', { url: url }, null, function (statuscode, body) {
                    var data = JSON.parse(body);
                    vueApp.loadData('userDeckFromUrl', false);
                    if (statuscode === 200) {
                        vueApp.modelUserDeck = {
                            url: url,
                            name: data.name,
                            mtgaFormat: data.mtgaFormat
                        };
                    }
                    else {
                        alert(data.error);
                    }
                });
            }
        },
        addUserDeck() {
            var body = {
                name: this.modelUserDeck.name.trim(),
                url: this.modelUserDeck.url.trim(),
                mtgaFormat: this.modelUserDeck.mtgaFormat.trim()
            };

            sendAjaxPost('/api/User/CustomDecks', body, null, (statuscode, body) => {
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    vueApp.modelUserDeck.name = '';
                    vueApp.modelUserDeck.url = '';
                    vueApp.modelUserDeck.mtgaFormat = '';

                    vueApp.refreshDecks();
                    vueApp.refreshUserDecks();
                    vueApp.refreshDashboard();
                }
                else {
                    alert(data.error);
                }
                var a = JSON.parse(body);
            });
        },
        deleteUserDeck(deckId) {
            sendAjaxDelete('/api/User/CustomDecks/' + deckId, null, null, (statuscode, body) => {
                if (vueApp.modelDeckSelected.id === deckId) {
                    vueApp.clearSelectedDeck();
                }
                vueApp.refreshDecks();
                vueApp.refreshUserDecks();
                vueApp.refreshDashboard();
            });
        },
        addUserScraper(type, name) {
            if (this.isLoadingData('userScraperAsync')) {
                alert('Please wait for the current operation to complete');
                return;
            }

            if (type !== 'streamdecker') {
                name = 'user_' + name;
            }

            if (this.getScrapersFlattened().filter(i => i.id === type + '-' + name.toLowerCase()).length > 0) {
                alert('This user is already monitored.');
                return;
            }

            var body = {
                id: type + '-' + name
            };
            this.scraperIdLoading = body.id;
            this.loadData('userScraperAsync', true);
            sendAjaxPost('/api/User/Scrapers', body, null, (statuscode, body) => {
                var data = JSON.parse(body);
                this.loadData('userScraperAsync', false);
                if (statuscode === 200) {
                    vueApp.scraperIdLoading = '';
                    vueApp.refreshDecks();
                    vueApp.refreshUserScrapers();
                    vueApp.refreshDashboard();
                }
                else {
                    alert(data.error);
                }
            });
        },
        getScrapersFlattened() {
            return this.modelUser.scrapers
                .reduce(function (a, b) { return a.concat(typeof b.bySection === 'undefined' ? [] : b.bySection.concat(b.byUser)); }, []);
        },
        saveUserScrapers: debounce(function () {
            //var idx = findWithAttr(this.modelUser.scrapers, 'id', scraperId);
            //var scraperInfo = this.modelUser.scrapers[idx];
            //var nbDecksAfter = this.modelDecks.decks.length + scraperInfo.nbDecks;
            var mergedActive = vueApp.getScrapersFlattened().filter(i => i.isActivated);

            var nbDecksAfter = mergedActive.reduce((a, b) => a += b.nbDecks, 0);
            if (/*activate &&*/ nbDecksAfter > vueApp.modelDecks.decks.length && nbDecksAfter >= vueApp.lotsOfDecks) {
                if (confirm('Monitoring a large amount of decks might cause the app to slow down. Are you sure?') === false) {
                    // User cancelled: Revert the value and don't call the server
                    //this.$set(scraperInfo, 'isActivated', false);
                    //this.$nextTick(function () {
                    //    var chkId = 'scraper' + scraperId.replace('-', '');
                    //    var chk = document.getElementById(chkId);
                    //    chk.checked = false;
                    //});
                    //return;
                    vueApp.refreshUserScrapers();
                    return;
                }
            }

            var scrapersActive = mergedActive.map(i => i.id);
            sendAjaxPut('/api/User/Scrapers', { ScrapersActive: scrapersActive }, null, (statuscode, body) => {
                if (statuscode === 200) {
                    vueApp.refreshDecks();
                    vueApp.refreshDashboard();
                }
                else {
                    var data = JSON.parse(body);
                    alert(data.error);
                }
            });
        }, 1000),
        formatScraperKey(key, keepType) {
            if (key === null)
                return '';

            if (key.startsWith('usercustomdeck'))
                return 'User custom deck';

            var parts = key.split('-');
            var type = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);

            var name = '';
            if (parts.length > 1)
                name = parts[1];

            if (name === 'averagearchetype') name = 'Average archetype';
            else if (name === 'meta') name = 'Meta';
            else if (name === 'metapaper') name = 'Meta (Paper)';
            else if (name === 'metaarena') name = 'Meta (Arena)';
            else if (name === 'againsttheodds') name = 'Against the Odds';
            else if (name === 'instantdecktech') name = 'Instant Deck Tech';
            else if (name === 'budgetmagic') name = 'Budget Magic';
            else if (name === 'goldfishgladiators') name = 'Goldfish Gladiators';
            else if (name === 'tier1') name = 'Tier 1';
            else if (name.startsWith('user_')) name = name.substring(5, name.length);

            if (key.indexOf('-arenastandard') >= 0) name = name + ' (Arena)';
            if (key.indexOf('-standard') >= 0) name = name + ' (Standard)';

            name = name.charAt(0).toUpperCase() + name.slice(1);

            if (keepType)
                name = this.formatScraperType(type.toLowerCase()) + ' ' + name;

            return name;
        },
        formatScraperType(type) {
            if (type === 'aetherhub') type = 'AetherHub';
            else if (type === 'streamdecker') type = 'StreamDecker';
            else if (type === 'mtggoldfish') type = 'MtgGoldfish';
            else if (type === 'mtgdecks') type = 'MtgDecks';

            return type;
        },
        saveTheme() {
            sendAjaxPost('/api/User/Theme?isDark=' + this.themeIsDark, null, null, (statuscode, body) => {
                if (statuscode !== 200) {
                    var data = JSON.parse(body);
                    alert(data.error);
                }
            });
        },
        setUserWeights() {
            if (isNaN(this.modelUser.weights.Mythic.main) || isNaN(this.modelUser.weights.Mythic.sideboard) ||
                isNaN(this.modelUser.weights.RareLand.main) || isNaN(this.modelUser.weights.RareLand.sideboard) ||
                isNaN(this.modelUser.weights.RareNonLand.main) || isNaN(this.modelUser.weights.RareNonLand.sideboard) ||
                isNaN(this.modelUser.weights.Uncommon.main) || isNaN(this.modelUser.weights.Uncommon.sideboard) ||
                isNaN(this.modelUser.weights.Common.main) || isNaN(this.modelUser.weights.Common.sideboard)) {
                alert('Some weights are invalid');
                return;
            }

            vueApp.loadData('setWeights', true);
            sendAjaxPut('/api/User/Weights', { weights: this.modelUser.weights }, null, (statuscode, body) => {
                vueApp.loadData('setWeights', false);
                if (statuscode === 200) {
                    vueApp.refreshDecks();
                    vueApp.refreshDashboard();
                }
                else {
                    var data = JSON.parse(body);
                    alert(data.error);
                }
            });
        },
        resetUserWeights() {
            vueApp.loadData('setWeights', true);
            sendAjaxPut('/api/User/Weights', { weights: null }, null, (statuscode, body) => {
                vueApp.loadData('setWeights', false);
                if (statuscode === 200) {
                    vueApp.refreshDecks();
                    vueApp.refreshDashboard();
                    vueApp.refreshUserWeights();
                }
                else {
                    var data = JSON.parse(body);
                    alert(data.error);
                }
            });
        },
        showWeightsProposed() {
            return vueApp.modelUser.collection.mtgaUserProfile.wildcards.Mythic > 1 &&
                vueApp.modelUser.collection.mtgaUserProfile.wildcards.Rare > 1 &&
                vueApp.modelUser.collection.mtgaUserProfile.wildcards.Uncommon > 1 &&
                vueApp.modelUser.collection.mtgaUserProfile.wildcards.Common > 1;
        },
        applyUserWeightsProposed() {
            this.modelUser.weights.Mythic.main = this.modelUser.weightsProposed.Mythic;
            this.modelUser.weights.RareLand.main = this.modelUser.weightsProposed.RareLand;
            this.modelUser.weights.RareNonLand.main = this.modelUser.weightsProposed.RareNonLand;
            this.modelUser.weights.Uncommon.main = this.modelUser.weightsProposed.Uncommon;
            this.modelUser.weights.Common.main = this.modelUser.weightsProposed.Common;

            setTimeout(function () {
                if (confirm('Do you want to update the weights right away?')) {
                    vueApp.setUserWeights();
                }
            }, 100);
        },
        sendMessage() {
            vueApp.loadData('sendMessage', true);
            sendAjaxPost('/api/Misc/Message', { Message: this.contactMessage }, null, (statuscode, body) => {
                vueApp.loadData('sendMessage', false);
                if (statuscode === 200) {
                    alert('Message sent!');
                    vueApp.contactMessage = '';
                }
                else {
                    var data = JSON.parse(body);
                    alert(data.error);
                }
            });
        },
        stopNotification(notifId) {
            this.modelUser.notificationsInactive.push(notifId);

            sendAjaxPost('/api/User/StopNotification?notificationId=' + notifId, null, null, (statuscode, body) => {
                if (statuscode !== 200) {
                    var data = JSON.parse(body);
                    alert(data.error);
                }
            });
        },
        resetNotifications() {
            this.modelUser.notificationsInactive = [];

            sendAjaxPost('/api/User/ResetNotifications', null, null, (statuscode, body) => {
                if (statuscode !== 200) {
                    var data = JSON.parse(body);
                    alert(data.error);
                }
            });
        },
        formatUserHistoryDetailsTitle() {
            var a = this.modelUserHistorySelected.newCards.reduce((prev, curr) => {
                if (curr.rarity === 'Mythic') prev.m++;
                else if (curr.rarity === 'Rare') prev.r++;
                else if (curr.rarity === 'Uncommon') prev.u++;
                else if (curr.rarity === 'Common') prev.c++;
                return prev;
            }, { m: 0, r: 0, u: 0, c: 0 });

            return [a.m + '<span class="tooltip" data-tooltip="Mythic"><img class="wc" src="/images/wcM.png" width="16" height="16" /></span>',
            a.r + '<span class="tooltip" data-tooltip="Rare"><img class="wc" src="/images/wcR.png" width="16" height="16" /></span>',
            a.u + '<span class="tooltip" data-tooltip="Uncommon"><img class="wc" src="/images/wcU.png" width="16" height="16" /></span>',
            a.c + '<span class="tooltip" data-tooltip="Common"><img class="wc" src="/images/wcC.png" width="16" height="16" /></span>']
                .filter(i => parseInt(i[0]) > 0)
                .join(', ');
        }
    },
    watch: {
        'themeIsDark': function (themeIsDark) {
            vueApp.themeHelper.theme = themeIsDark ? 'dark' : 'light';
        }
    }
});
