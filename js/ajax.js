function sendAjax(url, method, body, contentType, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            callback(xmlhttp.status, xmlhttp.responseText);
        }
    };

    xmlhttp.open(method, url, true);

    if (contentType === null) {
        contentType = 'application/json';
    }

    if (method === 'POST') {
        if (contentType !== false) {
            xmlhttp.setRequestHeader('Content-Type', contentType);
        }
    }

    if (contentType !== false) {
        body = JSON.stringify(body);
        xmlhttp.setRequestHeader('Content-Type', contentType);
    }
    xmlhttp.send(body);
}

function sendAjaxGet(url, callback) {
    sendAjax(url, 'GET', null, null, callback);
}

function sendAjaxPost(url, body, contentType, callback) {
    sendAjax(url, 'POST', body, contentType, callback);
}

function sendAjaxPatch(url, body, contentType, callback) {
    sendAjax(url, 'PATCH', body, contentType, callback);
}

function sendAjaxPut(url, body, contentType, callback) {
    sendAjax(url, 'PUT', body, contentType, callback);
}

function sendAjaxDelete(url, body, contentType, callback) {
    sendAjax(url, 'DELETE', body, contentType, callback);
}