var showText = function (target, message, index, interval) {
    if (vueApp.loading.length > 0) {
        if (index < message.length) {
            document.getElementById(target).innerHTML += message[index++];
            setTimeout(function () { showText(target, message, index, interval); }, interval);
        }
    }
}