function submitCollection() {
    var fileInput = document.getElementById('fileCollection');

    if (!fileInput.files[0]) {
        alert('Please select a file to upload.');
        return;
    }

    var file = fileInput.files[0];

    if (file.name.endsWith(".txt")) {
        alert('The file to upload must be a .zip file (not the Player.log file directly) and be less than 20 MB.');
        return;
    }
    else if (file.name.endsWith(".zip") === false) {
        alert('The file to upload must be a .zip file (not another extension or compression method like rar) and be less than 20 MB.');
        return;
    }
    else if (file.size > 52428800) {
        alert('Your file is too big. Try deleting the Player.log file, reopen the MTG Arena game, go browse your collection and close the game. This will generate a very small valid Player.log that you can ZIP and send here.');
        return;
    }

    var fdata = new FormData();
    fdata.append("fileCollection", file);

    vueApp.loadData('collectionPost', true);
    sendAjaxPost('/api/User/Collection', fdata, false, function (statuscode, body) {
        vueApp.loadData('collectionPost', false);
        try {
            // Can throw exception if file sent was too large, as we receive HTML page saying 404 blah blah
            var response = JSON.parse(body);

            if (statuscode === 201) {
                vueApp.modalData = {
                    type: 'userId'
                };

                vueApp.showUploadCollectionModal = false;
                vueApp.modelUser.collection = response;
                vueApp.refreshUserHistory();
                vueApp.refreshAll(false);
                vueApp.refreshCardsMissing();
                vueApp.calculateWeightsProposed();

                if (vueApp.modelUserDeckSelected.id !== '') {
                    var id = vueApp.modelUserDeckSelected.id;
                    vueApp.modelUserDeckSelected = {};
                    vueApp.getDeckTracked(id);
                }

                vueApp.currentSection = sectionMyData;
                vueApp.loadPage(pageCollection);
            }
            else if (statuscode === 401) {
                alert('Unauthorized access');
            }
            else {
                alert(response.error);
            }
        } catch (e) {
            alert('There was a problem with your file. Check that it\'s the text log file ZIPPED and that the file size is less than 20 MB.');
        }
    });
}