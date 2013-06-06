/// <reference path="/js/DataApp.js" />
// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var appbar;
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var viewStates = Windows.UI.ViewManagement.ApplicationViewState;

    WinJS.UI.Pages.define("/pages/tasks/tasks.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            var self = this;

            appbar = q("#appbar").winControl;
            appbar.sticky = true;
            appbar.disabled = true;

            var flyoutEdit = q("#flyoutEdit").winControl;
            flyoutEdit.placement = "right";
            flyoutEdit.aligment = "center";

            q(".tasks .pagetitle").innerText = options.title;

           // var dataArray = options.tasks;
            var dataList = Data.DataApp.getCurrentList(options.id);
            var listView = q("#tasksListView").winControl;
            this.listView = listView;
            listView.itemDataSource = dataList.dataSource;
            listView.itemTemplate = this._itemTemplateFunction;
            listView.oniteminvoked = function (event) {
                var element = listView.elementFromIndex(event.detail.itemIndex)//q('div', listView.elementFromIndex(event.detail.itemIndex));
                
                if (!WinJS.Utilities.hasClass(element, 'done'))
                {
                    WinJS.Utilities.addClass(element, 'done');
                    Data.DataApp.taskComplete(options.id, event.detail.itemIndex, true);
                } else
                {
                    WinJS.Utilities.removeClass(element, 'done');
                    Data.DataApp.taskComplete(options.id, event.detail.itemIndex, false);
                }

            };
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
            
            q("#flyoutEdit button").onclick = function (event) {
                var index = listView.selection.getIndices()[0];
                var data = dataList.getAt(index);
                data.description = q("#flyoutEdit input").value;
                dataList.setAt(listView.selection.getIndices()[0], data);
                listView.selection.clear();
                flyoutEdit.hide();
                Data.DataApp.editTask(options.id, index, data.description);

            }
            appbar.getCommandById("cmdEdit").onclick = function () {
                var selectedElement = listView.elementFromIndex(listView.selection.getIndices()[0]);
                flyoutEdit.anchor = selectedElement;
                q("#flyoutEdit input").value = dataList.getAt(listView.selection.getIndices()[0]).description;
                flyoutEdit.show();
            };
            appbar.getCommandById("cmdDelete").onclick = function () {
                var selectedList = listView.selection.getIndices();
                selectedList.sort(function (a, b) { return b - a });
                for (var i = dataList.length - 1; i >= 0; i--) {
                    for (var j = 0; j < selectedList.length; j++) {
                        if (selectedList[j] === i) {
                            dataList.splice(i, 1);
                            Data.DataApp.deleteTask(options.id, i);
                            break;
                        }
                    }
                }
            };
            appbar.getCommandById("cmdClear").onclick = function () {
                listView.selection.clear();
            }
            appbar.getCommandById("cmdSelectAll").onclick = function () {
                listView.selection.selectAll();
            }
            
          
            q("#inputAdd").onkeyup = function (event) {
                if (q("#inputAdd").value.length > 0 && event.keyCode === WinJS.Utilities.Key.enter) {
                    Data.DataApp.createTask(options.id, q("#inputAdd").value);
                    q("#inputAdd").value = "";
                }
            }
            var colorBtns = q("#flyoutEdit nav div");
            colorBtns.forEach(function (item, index) {
                item.onclick = function (event) {
                    var indexData = listView.selection.getIndices()[0];
                    var data = dataList.getAt(indexData);
                    data.color = "color" + (index + 1);
                    dataList.setAt(listView.selection.getIndices()[0], data);
                    Data.DataApp.editTaskColor(options.id, indexData, data.color);
                }
            });
            this._resize();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            console.log('tasks update layout');
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
        _itemTemplateFunction : function(itemPromise) {
            return itemPromise.then(function (item) {
                var container = document.createElement("div");
                var itemTemplate = document.getElementById("template-unmarked");
                if (item.data.completed) {
                    itemTemplate = document.getElementById("template-marked");
                    WinJS.Utilities.addClass(container, 'done');
                };
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
