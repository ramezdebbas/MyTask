/// <reference path="/js/DataApp.js" />
(function () {
    "use strict";

    var appbar;

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var viewStates = Windows.UI.ViewManagement.ApplicationViewState;

    
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.    

        ready: function (element, options) {
            // TODO: Initialize the page here.
            var appData = Windows.Storage.ApplicationData.current;
            var dataList;
            Data.DataApp.getData().done(function (data) {
                dataList = data;
                listView.itemDataSource = dataList.dataSource;
            });
            appbar = q("#appbar").winControl;
            appbar.sticky = true;
            appbar.disabled = true;
            var listView = q("#tasksListView").winControl;
            this.listView = listView;
            
            listView.itemTemplate = this._itemTemplateFunction;
            listView.oniteminvoked = function (event)
            {
                WinJS.Navigation.navigate("/pages/tasks/tasks.html", dataList.getAt(event.detail.itemIndex));
            };
            
            var flyoutEdit = q("#flyoutEdit").winControl;
            flyoutEdit.placement = "right";
            flyoutEdit.aligment = "center";

            listView.onselectionchanged = function (event) {
                if (listView.selection.getIndices().length > 0) {
                    appbar.disabled = false;
                    if (listView.selection.getIndices().length == 1) {
                       // appbar.getCommandById("cmdEdit").disabled = false;
                        appbar.showCommands(appbar.getCommandById("cmdEdit"), false);
                        appbar.hideCommands(appbar.getCommandById("cmdClear"), false);
                    } else {
                        //appbar.getCommandById("cmdEdit").disabled = true;
                        appbar.hideCommands(appbar.getCommandById("cmdEdit"), false);
                        appbar.showCommands(appbar.getCommandById("cmdClear"), false);
                    }
                    appbar.show();
                }
                else {
                    appbar.hide();
                    appbar.disabled = true;
                }
            }

            appbar.getCommandById("cmdEdit").onclick = function () {
                var selectedElement = listView.elementFromIndex(listView.selection.getIndices()[0]);
                flyoutEdit.anchor = selectedElement;
                q("#flyoutEdit input").value = dataList.getAt(listView.selection.getIndices()[0]).title;
                flyoutEdit.show();
            };
            appbar.getCommandById("cmdDelete").onclick = function () {
                var selectedList = listView.selection.getIndices();
                selectedList.sort(function (a, b) { return b - a });
                for (var i = dataList.length - 1; i >= 0; i--) {
                    for (var j = 0; j < selectedList.length; j++) {
                        if (selectedList[j] === i) {
                            dataList.splice(i, 1);
                        }
                    }
                };
                //appData.localSettings.values["dataTasks"] = JSON.stringify(dataList.slice(0));
                Data.DataApp.saveData();
            };
            appbar.getCommandById("cmdClear").onclick = function () {
                listView.selection.clear();
            }
            appbar.getCommandById("cmdSelectAll").onclick = function () {
                listView.selection.selectAll();
            }
           
            q("#inputAdd").onkeyup = function (event) {
                
                if (q("#inputAdd").value.length > 0 && event.keyCode === WinJS.Utilities.Key.enter) {
                    Data.DataApp.createList(q("#inputAdd").value);
                    q("#inputAdd").value = "";
                }
            }
  
            q("#flyoutEdit button").onclick = function (event) {
               
                var data = dataList.getAt(listView.selection.getIndices()[0]);
                if (q("#flyoutEdit input").value != "") {
                    data.title = q("#flyoutEdit input").value;
                    dataList.setAt(listView.selection.getIndices()[0], data);
                    
                    Data.DataApp.saveData();
                }
                
                listView.selection.clear();
                flyoutEdit.hide();
            }
            var colorBtns = q("#flyoutEdit nav div");
            colorBtns.forEach(function (item, index) {
                item.onclick = function (event) {
                    console.log('ae', index);
                    var data = dataList.getAt(listView.selection.getIndices()[0]);
                        data.color = "color"+(index+1);
                        dataList.setAt(listView.selection.getIndices()[0], data);

                        Data.DataApp.saveData();
                }
            });
            this._resize();
        },
        updateLayout: function (element,viewState,lastViewState) {
            console.log('home update layout');
            this._resize(viewState);
        },
        _resize: function (viewState) {
            viewState = viewState || appView.value;
            if (appView.value == viewStates.snapped) {
                this.listView.layout = new WinJS.UI.ListLayout();
            } else {
                this.listView.layout = new WinJS.UI.GridLayout();
            }
        },
        _itemTemplateFunction: function(itemPromise) {
            return itemPromise.then(function (item) {
                var container = document.createElement("div");
                var itemTemplate = document.getElementById("itemTemplateHome");
                var info = Data.DataApp.getInfoByIndex(item.data.id);
                item.data.info = info.completed + "/" + info.total + " completed tasks";
                if (item.data.color != undefined) {
                    WinJS.Utilities.addClass(container, item.data.color);
                }
               
                // Render selected template to DIV container

                itemTemplate.winControl.render(item.data, container);
                return container;
            });
        }
    });

})();
