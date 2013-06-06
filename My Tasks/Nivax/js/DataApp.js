/// <reference path="/js/Notifications.js" />
(function () {
    "use strict";
    var DataApp = WinJS.Class.define(function () {
       
    },
    null,
    {
        _appData: Windows.Storage.ApplicationData.current,
        _localFolder: null,
        _dataList: null,
        _currentList:null,
        init: function () {
            console.log('init');
            var self = this;
            return new WinJS.Promise(function (comp, err, prog) {
                self._appData.localSettings.values["listID"] = 0;
                self._appData.localSettings.values["newModelData"] = true;
                var dataArray = [];
                self._dataList = new WinJS.Binding.List(dataArray);
                self.createFileData().done(function () {
                    self.createList("Sample List")
                    comp();
                });
            });
        },
        getData: function ()
        {
            var self = this;
            this._localFolder = this._appData.localFolder;
            //
            return new WinJS.Promise(function (comp, err, prog) {
                if (self._appData.localSettings.values["dataTasks"]) {
                    console.log('transfer data');
                    // SE JÁ ESTIVER INSTALADO, GUARDA OS DADOS ANTIGOS E DELETA A FORMA ANTIGA
                    if (self._dataList === null) self._dataList = new WinJS.Binding.List(JSON.parse(self._appData.localSettings.values["dataTasks"]));
                    self._appData.localSettings.values["newModelData"] = true;
                    self._appData.localSettings.values.remove("dataTasks");
                    self.createFileData().done(function () {
                        comp(self._dataList);
                    });

                } else if (self._appData.localSettings.values["newModelData"]) {
                    console.log('nova  data');
                    self.readFileData().done(function () {
                        comp(self._dataList);
                    });
                }
                else {
                    self.init().done(function () {
                        comp(self._dataList);
                    });;
                }
            });
            
        },
        createFileData : function()
        {
            var self = this;
            return new WinJS.Promise(function (comp, err, prog) {
                self._localFolder.createFileAsync("dataFile.txt", Windows.Storage.CreationCollisionOption.openIfExists).then(function (sampleFile) {

                    return Windows.Storage.FileIO.writeTextAsync(sampleFile, JSON.stringify(self._dataList.slice(0)));
                }).done(function () {
                    comp();
                    console.log('save');

                });
            });
            
        },
        readFileData : function()
        {
            var self = this;
            return new WinJS.Promise(function (comp, err, prog) {
               
                self._localFolder.getFileAsync("dataFile.txt").then(function (sampleFile) {
                    return Windows.Storage.FileIO.readTextAsync(sampleFile);
                }).done(function (data) {
                    // Data is contained in file
                    if (self._dataList === null) self._dataList = new WinJS.Binding.List(JSON.parse(data));
                    comp();
                    console.log('get data ok');
                }, function () {
                    // data not found
                });
            });
        },
        getCurrentList: function (idList) {
            var o = this._dataList.filter(function (i) { return i.id === idList })[0];
            this._currentList = new WinJS.Binding.List(o.tasks);
            return this._currentList;
        },
        taskComplete: function (idList, index, completed) {
            var o = this._dataList.filter(function (i) { return i.id === idList })[0];
            this._currentList.getAt(index).completed = completed;
            o.tasks[index] = this._currentList.getAt(index);
            this.saveData();
        },
        editTask: function (idList, index,description)
        {
            var o = this._dataList.filter(function (i) { return i.id === idList })[0];
            this._currentList.getAt(index).description = description;
            o.tasks[index] = this._currentList.getAt(index);
            this.saveData();
        },
        editTaskColor: function (idList, index,color)
        {
            var o = this._dataList.filter(function (i) { return i.id === idList })[0];
            var data = this._currentList.getAt(index);

            this._currentList.getAt(index).color = color;
            o.tasks[index] = this._currentList.getAt(index);
            this.saveData();
        },
        deleteTask: function (idList, index) {
            var o = this._dataList.filter(function (i) { return i.id === idList })[0];
            this._currentList.splice(index, 1);
            o.tasks.splice(index, 1);
            this.saveData();
        },
        createList: function(value){
            this._dataList.push({ id: this._appData.localSettings.values["listID"]++, title: value, tasks: [], idTasks: 0, color: "color1" });
            this.saveData();
        },
        createTask: function (idList, value)
        {
            var o = this._dataList.filter(function (i) { return i.id === idList })[0];
            var task = { id: o.idTasks++, description: value, completed: false, color: "color1" };
            this._currentList.push(task);
            o.tasks.push(task);
            this.saveData();
            return task;
        },
        saveData: function ()
        { 
            this.createFileData();
            var info = this.getAllInfo();
            Utils.Notifications.push(this._dataList.length + " Todo List Tasks", info.completed + " Completed Tasks", info.toComplete + " Tasks to Complete");
        },
        getAllInfo: function() {
            var completed = 0;
            var toComplete = 0;
            this._dataList.forEach(function (item, index) {
                item.tasks.forEach(function (item, index) {
                    if (item.completed === true) {
                        completed++;
                    } else {
                        toComplete++;
                    }
                });
            });
            return { completed: completed, toComplete: toComplete, total: completed + toComplete }
        },
        getInfoByIndex: function(id) {
            var completed = 0;
            var toComplete = 0;
            this._dataList.forEach(function (item, index) {
                if(id == item.id){
                    item.tasks.forEach(function (item, index) {
                        if (item.completed === true) {
                            completed++;
                        } else {
                            toComplete++;
                        }
                    });
                }
            });
            return { completed: completed, toComplete: toComplete, total: completed + toComplete }
        },
        deleteAllData: function () {
            this._appData.localSettings.values.remove("dataTasks");
            this._appData.localSettings.values.remove("listID");
        }
    });

    WinJS.Namespace.define("Data", {
        DataApp: DataApp
    });
})();