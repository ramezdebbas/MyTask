(function () {
    "use strict";
    var Notifications = WinJS.Class.define(function () {
        // constructor
    }, null, {
        push: function(notificationText,notificationText2,notificationText3) {
            this.notifications = Windows.UI.Notifications;
            this.notifications.TileUpdateManager.createTileUpdaterForApplication().clear();
            this.template = this.notifications.TileTemplateType.tileWideText01;
            this.tileXML = this.notifications.TileUpdateManager.getTemplateContent(this.template);
            this.tileTextAttributes = this.tileXML.getElementsByTagName("text");
            this.tileTextAttributes[0].appendChild(this.tileXML.createTextNode(notificationText));
            this.tileTextAttributes = this.tileXML.getElementsByTagName("text");
            this.tileTextAttributes[1].appendChild(this.tileXML.createTextNode(notificationText2));
            this.tileTextAttributes = this.tileXML.getElementsByTagName("text");
            this.tileTextAttributes[2].appendChild(this.tileXML.createTextNode(notificationText3));
            this.tileNotification = new this.notifications.TileNotification(this.tileXML);
            this.notifications.TileUpdateManager.createTileUpdaterForApplication().update(this.tileNotification);
        },
      
        
    });

    WinJS.Namespace.define("Utils", {
        Notifications: Notifications
    });
})();