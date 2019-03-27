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

const sectionGeneral = 'general';
const sectionMyData = 'myData';

const pageHome = 'home';
const pageNews = 'news';
const pageStreams = 'streams';
const pageMeta = 'meta';
const pageDecks = 'decks';
const pageDeckSelected = 'deckSelected';
const pageCollection = 'collection';
const pageHistory = 'history';
const pageScrapers = 'scrapers';
const pageDecksTracked = 'decksTracked';
const pageDashboardSummary = 'dashboardSummary';
const pageDashboardDetails = 'dashboardDetails';
const pageProfile = 'profile';
const pageCustomDecks = 'customDecks';
const pageLands = 'lands';
const pageContact = 'contact';
const pageChangelog = 'changelog';
const pageShowSupport = 'showSupport';

const loadDeck = 'deck';
const loadDeckTracked = 'deckTracked';

var vueApp = new Vue({
    el: '#vueApp',
    data: {
        isAppLoaded: false,
        themes: {
            light: "css/bulma.min.css",
            dark: "css/bulma-dark.min.css"
        },
        themeHelper: new ThemeHelper(),
        themeIsDark: true,
        themeIsDarkInitial: true,
        dynamicLanding: true,

        scryfallImagesPrefix: 'https://img.scryfall.com/cards',
        iconLand: 'https://c-4tvylwolbz88x24nhtlwlkphx2ejbyzljkux2ejvt.g00.gamepedia.com/g00/3_c-4tan.nhtlwlkph.jvt_/c-4TVYLWOLBZ88x24oaawzx3ax2fx2fnhtlwlkph.jbyzljku.jvtx2ftanzhschapvu_nhtlwlkphx2f0x2f04x2fShuk_zftivs.zcnx3fclyzpvux3dj4691m071m4544409k709i17hj9k41j1x26p87j.thyrx3dpthnl_$/$/$/$/$',

        mouseX: 0,
        mouseY: 0,
        showUploadCollectionModal: false,
        showLoginModal: false,
        showModalShareDeck: false,

        loginUserId: '',

        lotsOfDecks: 1000,

        //loginWithUserId: '',

        currentSection: sectionGeneral,
        currentPage: pageCollection,
        currentPageProfileLandsType: 'Plains',

        loading: [],
        scraperIdLoading: '',

        modelCardSelectedUrl: '',
        contactMessage: '',

        modelChangelog: [],

        // General Decks page
        modelDeckSelected: {
            id: '',
            cardsMain: [],
            cardsSideboard: []
            // ...
        },

        modelDecks: {
            filters: {
                scraperTypeId: '(All)',
                name: '',
                color: '',
                date: ''
            },
            decks: []
        },
        modelDecksFiltered: {
            perPage: 200,
            currentPage: 0,
            decks: []
        },

        // Tracked decks page
        modelUserDeckSelected: {
            id: '',
            cardsMain: [],
            cardsSideboard: []
        },

        modelUserDecks: {
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
        modelUserDecksFiltered: {
            perPage: 100,
            currentPage: 0,
            decks: []
        },

        modelUser: {
            id: '',
            nbLogin: 0,
            changesSinceLastLogin: false,
            collection: {
                collectionDate: 'Unknown',
                cards: [],
                mtgaUserProfile: {
                    wildcards: {
                        Common: 0,
                        Uncommon: 0,
                        Rare: 0,
                        Mythic: 0,
                    }
                }
            },
            decks: [],
            scrapers: [
                //{
                //    //type: '',
                //    //searchByUser: '',
                //    //bySection: [
                //    //    { ScraperDto }
                //    //],
                //    //byUser: [
                //    //    { ScraperDto }
                //    //]
                //}
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

        modelUserCollectionFiltered: {
            filtered: [],
            cardsMissing: [],

            filters: {
                sets: ['', 'XLN', 'RIX', 'DOM', 'M19', 'GRN', 'RNA'],
                rarities: ['', 'Mythic', 'Rare', 'Uncommon', 'Common'],

                set: '',
                rarity: '',
                showMissing: false
            }
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

        modelLands: [],
        modelSets: [],
        modelNews: []
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
        this.getSets();
        this.getNews();
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

            if (pageName === pageNews ||
                pageName === pageDecks ||
                pageName === pageMeta ||
                pageName === pageStreams) {
                this.currentSection = sectionGeneral;
            }
            else if (pageName === pageDecksTracked ||
                pageName === pageCollection ||
                pageName === pageHistory ||
                pageName === pageDecksTracked ||
                pageName === pageScrapers ||
                pageName === pageDashboardSummary ||
                pageName === pageDashboardDetails) {
                this.currentSection = sectionMyData;
            }
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
            return this.modelUserDecks.decks.length >= this.lotsOfDecks && this.loading.indexOf(pageDecksTracked) >= 0;
        },
        isNotificationActive(key) {
            return this.modelUser.notificationsInactive.indexOf(key) < 0;
        },
        showCard(imageUrl) {
            if (imageUrl === null) {
                this.modelCardSelectedUrl = '';
            }
            else {
                this.modelCardSelectedUrl = this.scryfallImagesPrefix + imageUrl;
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

                var urlParams = new URLSearchParams(window.location.search);
                var p1 = urlParams.get('p1');
                if (p1 !== null) {
                    // Avoid dynamic landing if a route is used
                    vueApp.dynamicLanding = false;

                    vueApp.loadPage(p1);
                    var p2 = urlParams.get('p2');
                    if (p2 !== null) {
                        switch (p1) {
                            //case pageProfile:
                            //    vueApp.getLands();
                            //    vueApp.currentPageProfile = p2;
                            //    break;
                            case pageDecksTracked:
                                vueApp.getDeckByHash(p2);
                                break;
                        }
                    }

                    history.pushState(null, '', '/');
                }

                vueApp.refreshAll(true);
            });
        },
        refreshAll(refreshCollection) {
            this.refreshDecks();
            this.refreshDecksTracked();
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

                    if (vueApp.dynamicLanding && vueApp.modelUser.collection.cards.length > 0)
                        vueApp.currentSection = sectionMyData;

                    vueApp.filterCollection();
                    vueApp.refreshUserHistory();
                });
                this.loadData('collectionMissingGet', true);
                sendAjaxGet('/api/User/Collection/Missing', (statuscode, body) => {
                    vueApp.loadData('collectionMissingGet', false);
                    vueApp.modelUserCollectionFiltered.cardsMissing = JSON.parse(body).cardsMissing;
                });
            }

            this.filterCollection();
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
            this.loadData(pageDecks, true);
            sendAjaxGet('/api/Decks', (statuscode, body) => {
                vueApp.modelDecks.decks = JSON.parse(body).decks;
                vueApp.filterDecks(false);
                vueApp.loadData(pageDecks, false);
            });
        }),
        refreshDecksTracked: debounce(function () {
            this.loadData(pageDecksTracked, true);
            sendAjaxGet('/api/User/Decks', (statuscode, body) => {
                vueApp.modelUserDecks.decks = JSON.parse(body).decks;
                vueApp.filterDecks(true);
                vueApp.loadData(pageDecksTracked, false);
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
        refreshUserScrapers() {
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

                vueApp.filterDecks();
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
        getSets() {
            this.loadData('getSets', true);
            sendAjaxGet('/api/Misc/Sets', (statuscode, body) => {
                vueApp.loadData('getSets', false);
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    vueApp.modelSets = data.sets;
                }
                else {
                    alert(data.error);
                }
            });
        },
        getNews() {
            this.loadData('getNews', true);
            sendAjaxGet('/api/Misc/News', (statuscode, body) => {
                vueApp.loadData('getNews', false);
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    vueApp.modelNews = data;
                }
                else {
                    alert(data.error);
                }
            });
        },
        computeSets() {
            var data = this.modelSets
                .groupBy('name')
                .map(function (i) { return { name: i.key, totalCards: i.values.reduce(function (a, b) { return a + b.totalCards; }, 0) }; });

            var computed = data
                .map(function (set) {
                    return {
                        name: set.name,
                        nbOwned: vueApp.modelUser.collection.cards.filter(i => i.set === set.name).reduce(function (a, b) { return a + b.amount; }, 0),
                        nbTotal: set.totalCards * 4,
                        pct: vueApp.modelUser.collection.cards.filter(i => i.set === set.name).reduce(function (a, b) { return a + b.amount; }, 0) / (set.totalCards * 4)
                    };
                });

            computed.sort(function (a, b) { return b.pct - a.pct; });

            return computed;
        },
        getLands() {
            this.loadData('getLands', true);
            sendAjaxGet('/api/Misc/Lands', (statuscode, body) => {
                vueApp.loadData('getLands', false);
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    var landsGrouped = data.lands
                        .groupBy('name')
                        .map(i => {
                            return {
                                type: i.key,
                                cards: i.values
                            };
                        });
                    vueApp.modelLands = landsGrouped;
                }
                else {
                    alert(data.error);
                }
            });
        },
        toggleLand(land) {
            land.isSelected = !land.isSelected;
        },
        saveLandsPreference: debounce(function () {
            vueApp.loadData('setLands', true);

            var landsSelected = vueApp.modelLands
                .reduce((a, b) => { return a.concat(b.cards); }, [])
                .filter(i => i.isSelected)
                .map(i => i.grpId);;

            var body = {
                lands: landsSelected
            };
            sendAjaxPut('/api/User/Lands', body, null, (statuscode, body) => {
                vueApp.loadData('setLands', false);
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    var i = 0;
                }
                else {
                    alert(data.error);
                }
            });
        }, 3000),
        filterCollection() {
            var set = this.modelUserCollectionFiltered.filters.set;
            var rarity = this.modelUserCollectionFiltered.filters.rarity;

            var filtered = [];

            var source = this.modelUserCollectionFiltered.filters.showMissing ? this.modelUserCollectionFiltered.cardsMissing : this.modelUser.collection.cards;

            source.forEach(i => {
                var f = true;
                f &= set === '' || i.set === set;
                f &= rarity === '' || i.rarity === rarity;

                if (f) filtered.push(i);
            });

            this.modelUserCollectionFiltered.filtered = filtered;
            this.$forceUpdate();
        },
        collectionIsFiltered() {
            return this.modelUserCollectionFiltered.filters.rarity !== ''
                || this.modelUserCollectionFiltered.filters.set !== ''
                || this.modelUserCollectionFiltered.filters.showMissing;
        },
        clearFiltersCollection() {
            this.modelUserCollectionFiltered.filters.rarity = '';
            this.modelUserCollectionFiltered.filters.set = '';
            this.modelUserCollectionFiltered.filters.showMissing = false;
            this.filterCollection();
        },
        filterDecks(tracked) {
            // default value
            if (typeof tracked === 'undefined') tracked = true;

            var scraperTypeId = this.modelDecks.filters.scraperTypeId;
            var name = this.modelDecks.filters.name.trim();
            var color = this.modelDecks.filters.color.trim().toUpperCase();
            var date = this.modelDecks.filters.date.trim();
            // tracked only
            var weight = this.modelUserDecks.filters.missingWeight;
            var showUntracked = this.modelUserDecks.filters.showUntracked;

            if (tracked) {
                scraperTypeId = this.modelUserDecks.filters.scraperTypeId;
                name = this.modelUserDecks.filters.name.trim();
                color = this.modelUserDecks.filters.color.trim().toUpperCase();
                date = this.modelUserDecks.filters.date.trim();
                //weight = this.modelUserDecks.filters.missingWeight;
                //showUntracked = this.modelUserDecks.filters.showUntracked;
            }

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

            var decks = tracked ? this.modelUserDecks.decks : this.modelDecks.decks;
            decks.forEach(i => {
                var f = true;

                var fSourceFound = i.scraperTypeId !== null && scraperTypeId !== null && i.scraperTypeId.toLowerCase().indexOf(scraperTypeId.toLowerCase()) >= 0;
                var fSourceUnknown = scraperTypeId !== '' || i.scraperTypeId === '';
                var fSourceNull = i.scraperTypeId === null && scraperTypeId === null;
                f &= scraperTypeId === '(All)' || (fSourceFound && fSourceUnknown) || fSourceNull;

                f &= name === '' || i.name.toLowerCase().indexOf(name.toLowerCase()) >= 0;
                f &= color === '' || i.color === color;
                f &= date === '' || i.dateCreated.substring(0, 10) === date || isDateInRange(i.dateCreated);

                if (tracked) {
                    f &= weight === '' || isWeightInRange(i.missingWeight);
                    f &= i.priorityFactor > 0 || showUntracked;
                }

                if (f) filtered.push(clone(i));
            });

            if (tracked) {
                this.modelUserDecksFiltered = {
                    decks: filtered,
                    perPage: 100,
                    currentPage: 0,
                };
            }
            else {
                this.modelDecksFiltered = {
                    decks: filtered,
                    perPage: 200,
                    currentPage: 0,
                };
            }
        },
        decksAreFiltered(tracked) {
            // default value
            if (typeof tracked === 'undefined') tracked = true;

            if (tracked) {
                return this.modelUserDecks.filters.scraperTypeId !== '(All)'
                    || this.modelUserDecks.filters.name !== ''
                    || this.modelUserDecks.filters.color !== ''
                    || this.modelUserDecks.filters.date !== ''
                    || this.modelUserDecks.filters.missingWeight !== ''
                    || this.modelUserDecks.filters.showUntracked;
            }
            else {
                return this.modelDecks.filters.scraperTypeId !== '(All)'
                    || this.modelDecks.filters.name !== ''
                    || this.modelDecks.filters.color !== ''
                    || this.modelDecks.filters.date !== '';
            }
        },
        clearFiltersDecks(tracked) {
            // default value
            if (typeof tracked === 'undefined') tracked = true;

            if (tracked) {
                this.modelUserDecks.filters.scraperTypeId = '(All)';
                this.modelUserDecks.filters.name = '';
                this.modelUserDecks.filters.color = '';
                this.modelUserDecks.filters.date = '';
                this.modelUserDecks.filters.missingWeight = '';
                this.modelUserDecks.filters.showUntracked = false;
            }
            else {
                this.modelDecks.filters.scraperTypeId = '(All)';
                this.modelDecks.filters.name = '';
                this.modelDecks.filters.color = '';
                this.modelDecks.filters.date = '';
            }

            this.filterDecks(tracked);
        },
        displayTotalCards(cards, isSideboard) {
            var nb = 0;
            if (isSideboard) {
                if (typeof (cards) !== 'undefined') {
                    nb = cards.reduce((a, b) => a += b.amount, 0);
                }

                return 'Sideboard (' + nb + ' cards)';
            }
            else {
                nb = cards.reduce((a, b) => a += b.amount, 0);
                var nbLands = cards
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

            var idxFiltered = findWithAttr(this.modelUserDecksFiltered.decks, 'id', deckId);
            this.$set(this.modelUserDecksFiltered.decks[idxFiltered], 'priorityFactor', p);
            this.$set(this.modelUserDecksFiltered.decks[idxFiltered], 'missingWeight', this.modelUserDecksFiltered.decks[idxFiltered].missingWeightBase * this.modelUserDecksFiltered.decks[idxFiltered].priorityFactor);

            this.loadData('dashboard', true);
            sendAjaxPatch('/api/User/DeckPriorityFactor', { DeckId: deckId, Value: p }, null, (statuscode, body) => {
                vueApp.refreshDashboard();
            });
        },
        stopTracking(deckId) {
            var idx = findWithAttr(this.modelUserDecks.decks, 'id', deckId);
            this.modelUserDecks.decks[idx].priorityFactor = 0;

            var idxFiltered = findWithAttr(this.modelUserDecksFiltered.decks, 'id', deckId);
            this.$set(this.modelUserDecksFiltered.decks[idxFiltered], 'priorityFactor', 0);

            this.loadData('dashboard', true);
            sendAjaxPatch('/api/User/DeckPriorityFactor', { DeckId: deckId, Value: 0 }, null, (statuscode, body) => {
                vueApp.refreshDashboard();
            });

            if (this.modelUserDecks.filters.showUntracked) {
                // Still preserve item in filtered list for display
            }
            else {
                this.modelUserDecksFiltered.decks.splice(idxFiltered, 1);

                if (this.modelUserDeckSelected.id === deckId) {
                    this.clearSelectedDeck();
                }
                //else {

                //}
            }
        },
        resetDecksPriorityFactor(value) {
            this.loadData(pageDecksTracked, true);
            this.loadData('dashboard', true);
            sendAjaxPatch('/api/User/DeckPriorityFactor/ResetAll', { Value: value }, null, (statuscode, body) => {
                vueApp.refreshDecksTracked();
                vueApp.refreshDashboard();
            });
        },
        trackFilteredDecks(doTrack) {
            this.loadData(pageDecksTracked, true);
            this.loadData('dashboard', true);
            var decks = this.modelUserDecksFiltered.decks.map((d) => d.id);
            sendAjaxPatch('/api/User/DeckPriorityFactor/FilteredDecks', { DoTrack: doTrack, Decks: decks }, null, (statuscode, body) => {
                vueApp.refreshDecksTracked();
                vueApp.refreshDashboard();
            });
        },
        getDecksPages(tracked) {
            // default value
            if (typeof tracked === 'undefined') tracked = true;
            var currentPage = tracked ? this.modelUserDecksFiltered.currentPage : this.modelDecksFiltered.currentPage;

            var totalPages = tracked ? this.decksTrackedTotalPages : this.decksTotalPages;
            var arr = Array.from(Array(totalPages).keys());
            var arr2 = arr.map(i => Math.abs(i - currentPage) < 2 || i === totalPages - 1 || i === 0 ? i : '...');

            var arr3 = [];
            var last = '';
            arr2.forEach(i => { if (i !== last) arr3.push(i); last = i; });

            return arr3;
        },
        getDeck(deckId) {
            vueApp.currentPage = pageDeckSelected;

            if (this.modelDeckSelected.id === deckId)
                return;

            this.modelDeckSelected.id = deckId;
            this.loadData(loadDeck, true);

            sendAjaxGet('/api/Decks/' + deckId, function (statuscode, body) {
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    vueApp.modelDeckSelected = data.deck;
                    vueApp.loadData(loadDeck, false);
                }
                else {
                    alert(data.error);
                }
            });
        },
        getDeckTracked(deckId) {
            if (this.modelUserDeckSelected.id === deckId)
                return;

            this.modelUserDeckSelected.id = deckId;
            this.loadData(loadDeckTracked, true);

            sendAjaxGet('/api/Decks/' + deckId, function (statuscode, body) {
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    vueApp.modelUserDeckSelected = data.deck;
                    vueApp.loadData(loadDeckTracked, false);
                }
                else {
                    alert(data.error);
                }
            });
        },
        getDeckByHash(hash) {
            this.loadData('deck', true);

            sendAjaxGet('/api/Decks/ByHash/' + hash, function (statuscode, body) {
                var data = JSON.parse(body);
                if (statuscode === 200) {
                    vueApp.modelUserDeckSelected = data.deck;
                    vueApp.loadData('deck', false);
                }
                else {
                    alert(data.error);
                }
            });
        },
        clearSelectedDeck() {
            this.modelUserDeckSelected = {
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

            this.loadPage(pageDashboardDetails);
        },
        goToDeck(deckId, deckName) {
            this.clearFiltersDecks();
            this.modelUserDecks.filters.name = deckName;
            this.modelUserDecks.filters.showUntracked = true;
            this.filterDecks();

            this.loadPage(pageDecksTracked);
            this.getDeckTracked(deckId);
        },
        getDeckFromUrl() {
            var url = this.modelUserDeck.url.toLowerCase();
            if (url.startsWith('https://aetherhub.com/deck/public') ||
                url.startsWith('https://www.mtggoldfish.com/')) {
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

                    vueApp.refreshDecksTracked();
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
                if (vueApp.modelUserDeckSelected.id === deckId) {
                    vueApp.clearSelectedDeck();
                }
                vueApp.refreshDecksTracked();
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
                    vueApp.refreshDecksTracked();
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
            //var nbDecksAfter = this.modelUserDecks.decks.length + scraperInfo.nbDecks;
            var mergedActive = vueApp.getScrapersFlattened().filter(i => i.isActivated);

            var nbDecksAfter = mergedActive.reduce((a, b) => a += b.nbDecks, 0);
            if (/*activate &&*/ nbDecksAfter > vueApp.modelUserDecks.decks.length && nbDecksAfter >= vueApp.lotsOfDecks) {
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
                    vueApp.refreshDecksTracked();
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
            else if (name === 'budgetarena') name = 'Budget Arena';
            else if (name === 'fishfiveo') name = 'Fish Five-0';
            else if (name === 'muchabrew') name = 'Much Abrew About Nothing';
            else if (name === 'streamhighlights') name = 'Stream Highlights';
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
                    vueApp.refreshDecksTracked();
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
                    vueApp.refreshDecksTracked();
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
                if (curr.rarity === 'Mythic') prev.m += curr.amount;
                else if (curr.rarity === 'Rare') prev.r += curr.amount;
                else if (curr.rarity === 'Uncommon') prev.u += curr.amount;
                else if (curr.rarity === 'Common') prev.c += curr.amount;
                return prev;
            }, { m: 0, r: 0, u: 0, c: 0 });

            return [
                a.c + '<span class="tooltip" data-tooltip="Common"><img class="wc" src="/images/wcC.png" width="16" height="16" /></span>',
                a.u + '<span class="tooltip" data-tooltip="Uncommon"><img class="wc" src="/images/wcU.png" width="16" height="16" /></span>',
                a.r + '<span class="tooltip" data-tooltip="Rare"><img class="wc" src="/images/wcR.png" width="16" height="16" /></span>',
                a.m + '<span class="tooltip" data-tooltip="Mythic"><img class="wc" src="/images/wcM.png" width="16" height="16" /></span>'
            ]
                .filter(i => parseInt(i[0]) > 0)
                .join(', ');
        }
    },
    computed: {
        decksTotalPages: function () {
            return Math.ceil(this.modelDecksFiltered.decks.length / this.modelDecksFiltered.perPage);
        },
        decksTrackedTotalPages: function () {
            return Math.ceil(this.modelUserDecksFiltered.decks.length / this.modelUserDecksFiltered.perPage);
        },
        paginatedDecks: function () {
            var list = this.modelDecksFiltered.decks;

            if (this.modelDecksFiltered.currentPage >= this.decksTotalPages) {
                this.modelDecksFiltered.currentPage = this.decksTotalPages - 1;
            }
            var index = this.modelDecksFiltered.currentPage * this.modelDecksFiltered.perPage;
            return list.slice(index, index + this.modelDecksFiltered.perPage);
        },
        paginatedDecksTracked: function () {
            var list = this.modelUserDecksFiltered.decks;

            if (this.modelUserDecksFiltered.currentPage >= this.decksTrackedTotalPages) {
                this.modelUserDecksFiltered.currentPage = this.decksTrackedTotalPages - 1;
            }
            var index = this.modelUserDecksFiltered.currentPage * this.modelUserDecksFiltered.perPage;
            return list.slice(index, index + this.modelUserDecksFiltered.perPage);
        },
        dictScraperUrl: function () {
            var info = vueApp.modelUser.scrapers
                .map(i => i.bySection.map(j => { return { id: j.id, url: j.url } }).concat(i.byUser.map(j => { return { id: j.id, url: j.url } })));

            return info.reduce((a, b) => a.concat(b), []).reduce((a, b) => { a[b.id] = b.url; return a; }, {});
        },
        isPagePublic: function () {
            return this.currentPage === pageNews ||
                this.currentPage === pageStreams ||
                this.currentPage === pageMeta ||
                this.currentPage === pageDecks ||
                this.currentPage === pageDeckSelected ||
                this.currentPage === pageLands;
        }
    },
    watch: {
        'themeIsDark': function (themeIsDark) {
            vueApp.themeHelper.theme = themeIsDark ? 'dark' : 'light';
        },
        'loading': function (newValue, oldValue) {
            if (this.modelUser.nbLogin >= 20 && oldValue.length === 0 && newValue.length === 1) {
                document.getElementById('msg').innerHTML = '';
                showText("msg", "Please wait...we're gathering your data. If you've been enjoying MTGAHelper and wish to support the project, see how you can do so by clicking on the button on the bottom right...Thanks!", 0, 60);
            }
        }
    }
});
