sap.ui.define([
	"sap/f/library",
	"sap/m/SplitContainer",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter"
], function (fioriLibrary, SplitContainer, MessageToast, MessageBox, Controller, XMLView, History, UIComponent, JSONModel, Filter,
	FilterOperator, formatter) {
	"use strict";
	return Controller.extend("constants.model.routes.controllers.App1Table", {
		formatter: formatter,
		onInit: function () {
			console.log("hola");
			let oModel = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(oModel, "mLocalProductoStockVentas");
			this.oLocal = {
				IDLOCAL: "",
				NOMBRELOCAL: ""
			};
			this.Odata = this.getView().getModel();
			this.getView().setModel(oModel, "excelModel");
			this.bus = this.getOwnerComponent().getEventBus();
		},
		onNavPress: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RouteMaster", {}, true);
			}
		},
		onFilter: function () {
			var filters = [];
			var Nom = this.getView().byId("SearchField").getValue();
			var Id = this.getView().byId("SearchField1").getValue();
			var tabla = this.getView().byId("productsTable");
			var binding = tabla.getBinding("items");
			if (Id && Id.length > 0 && Id != 0) {
				filters.push(new Filter("IDLOCAL", FilterOperator.Contains, Id.padStart(3, '0')));
			};
			if (Nom && Nom.length > 0) {
				filters.push(new Filter("NOMBRELOCAL", FilterOperator.Contains, Nom));
			};
			binding.filter(filters);
		},
		uploadExcelModel: function (oEvent) {
			this._importExcel(oEvent.getParameter("files"), 0);
		},
		_importExcel: function (files, index) {
			let file = files[index];
			if (file && window.FileReader) {
				let excelData = [];
				let reader = new FileReader();
				reader.onload = function (oEvent) {
					let data = oEvent.target.result;
					let workbook = XLSX.read(data, {
						type: 'binary'
					});
					let excelModel = this.getView().getModel("excelModel");
					let json = excelModel.getData();
					// 	let lastId = 1;
					// 	if (json.length > 0) {
					// 		lastId = json[json.length - 1].id + 1;
					// }
					workbook.SheetNames.forEach(function (sheetName) {
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
						for (var i in excelData) {
							// excelData[i].id = lastId;
							// lastId = lastId + 1;
							excelData[i].IDLOCAL = excelData[i]["IDLOCAL"];
							excelData[i].NOMBRELOCAL = excelData[i]["NOMBRELOCAL"]
							excelData[i].IDVENTAS = excelData[i]["IDVENTAS"]
							excelData[i].PRODUCTOVENDIDO = excelData[i]["PRODUCTOVENDIDO"]
							json.push(excelData[i]);
						}
					});
					json.sort(function (a, b) {
						return a.IDLOCAL - b.IDLOCAL;
					});
					excelModel.refresh();
					this._importExcel(files, index + 1);
					if (this.getView().getModel("excelModel").getData().length > 0) {
						this.onExcelUpload();
					} else {
						MessageBox.alert(this.getView().getModel("i18n").getProperty("excel404"), {
							title: this.getView().getModel("i18n").getProperty("excel404Title")
						});
					}
				}.bind(this)
				reader.onerror = function (ex) {
					console.log(this.getView().getModel("i18n").getProperty("excelReadError"))
				}.bind(this);
				reader.readAsBinaryString(file);
			}
		},
		onExcelUpload: function () {
			var oView = this.getView();
			if (!this.openDialog) {
				this.openDialog = sap.ui.xmlfragment("IdFragment", "NGI1.Ferreterias.utils.fragments.App1DialogUploadExcel", this);
				oView.addDependent(this.openDialog);
			}
			this.openDialog.open();
		},
		uploadExcelFiles: function (oEvent) {
			var OData = this.getView().getModel();
			var that = this;
			var filesData = this.getView().getModel("excelModel").getData();
			var sPath = "/LOCALSet";
			var sPathC1 = "/VENTASSet";
			var sPathPrev = `/LOCALSet('${this.oLocal.IDLOCAL}')/TOVENTAS`
			var successCreate = [false, false];
			var invalidRecord = false;
			var failedRecords = [];
			var countSuccess = 0;
			OData.setUseBatch(false);
			for (var i = 0; i < filesData.length; i++) {
				var fileData = filesData[i];
				var data = {
					sData: {
						IDLOCAL: "",
						NOMBRELOCAL: ""
					},
					sDataC1: {
						IDVENTAS: "",
						IDLOCAL: "",
						PRODUCTOVENDIDO: ""
					}
				};
				var charRegex = /^[^\s].*[^\s]$/;
				var numericRegex = /^[0-9]+$/;
				if (fileData.IDLOCAL === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedIDLOCAL"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.IDLOCAL.includes(" ") || fileData.IDLOCAL.startsWith("0")) {
					console.log(this.getView().getModel("i18n").getProperty("spaceOrInitZerosIDLOCAL"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (!numericRegex.test(fileData.IDLOCAL)) {
					console.log(this.getView().getModel("i18n").getProperty("numberIDLOCAL"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.IDLOCAL < 1 || fileData.IDLOCAL > 999) {
					console.log(this.getView().getModel("i18n").getProperty("rangeIDLOCAL"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.NOMBRELOCAL === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedNOMBRELOCAL"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (!charRegex.test(fileData.NOMBRELOCAL) || fileData.NOMBRELOCAL.trim() === '') {
					console.log(this.getView().getModel("i18n").getProperty("charNOMBRELOCAL"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.NOMBRELOCAL.length < 2 || fileData.NOMBRELOCAL.length > 30) {
					console.log(this.getView().getModel("i18n").getProperty("rangeNOMBRELOCAL"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.IDVENTAS === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedIDVENTAS"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.IDVENTAS.includes(" ") || fileData.IDVENTAS.startsWith("0")) {
					console.log(this.getView().getModel("i18n").getProperty("spaceOrInitZerosIDVENTAS"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (!numericRegex.test(fileData.IDVENTAS)) {
					console.log(this.getView().getModel("i18n").getProperty("numberIDVENTAS"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.IDVENTAS < 1 || fileData.IDVENTAS > 999) {
					console.log(this.getView().getModel("i18n").getProperty("rangeIDVENTAS"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.PRODUCTOVENDIDO === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedPRODUCTOVENDIDO"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (!charRegex.test(fileData.PRODUCTOVENDIDO) || fileData.PRODUCTOVENDIDO.trim() === '') {
					console.log(this.getView().getModel("i18n").getProperty("charPRODUCTOVENDIDO"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				if (fileData.PRODUCTOVENDIDO.length < 2 || fileData.PRODUCTOVENDIDO.length > 30) {
					console.log(this.getView().getModel("i18n").getProperty("rangePRODUCTOVENDIDO"),
						i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDVENTAS: fileData.IDVENTAS
					});
					continue;
				}
				countSuccess++;
				data.sData.IDLOCAL = fileData.IDLOCAL.padStart(3, '0');
				data.sData.NOMBRELOCAL = fileData.NOMBRELOCAL;
				data.sDataC1.IDVENTAS = fileData.IDVENTAS.padStart(3, '0');
				data.sDataC1.IDLOCAL = data.sData.IDLOCAL;
				data.sDataC1.PRODUCTOVENDIDO = fileData.PRODUCTOVENDIDO;
				OData.create(sPath, data.sData, {
					success: function (response) {
						successCreate[0] = true;
					},
					error: function (error) {
						console.error(
							that.getView().getModel("i18n").getProperty("localVentasCreateError"),
							error);
						successCreate[0] = false;
						let texto = error.responseText
						let errorStock = texto.indexOf(
							that.getView().getModel("i18n").getProperty("maxLocal"))
						if (errorStock) {
							MessageToast.show(that.getView().getModel("i18n").getProperty("localError"));
						}
					}
				});
				if (successCreate[0] = true) {
					OData.create(sPathC1, data.sDataC1, {
						success: function (response) {
							successCreate[1] = true;
						},
						error: function (error) {
							console.error(
								that.getView().getModel("i18n").getProperty("ventasCreateError"),
								error);
							let texto = error.responseText
							let errorStock = texto.indexOf(
								that.getView().getModel("i18n").getProperty("maxVentas"))
							if (errorStock) {
								MessageToast.show(that.getView().getModel("i18n").getProperty("ventasError"));
							}
						}
					});
				}
			}
			if (failedRecords.length > 0) {
				console.log(this.getView().getModel("i18n").getProperty("failedRecords"));
				console.table(failedRecords);
			}
			if (countSuccess === filesData.length) {
				MessageBox.success(
					this.getView().getModel("i18n").getProperty("successRecordsCount"), {
						title: this.getView().getModel("i18n").getProperty("excelSuccessTitle")
					});
			}
			if (countSuccess < filesData.length && countSuccess != 0) {
				MessageBox.alert(
					`${this.getView().getModel("i18n").getProperty("firstErrorRecordsCount")}
						 ${countSuccess}/${filesData.length} 
						${this.getView().getModel("i18n").getProperty("secondErrorRecordsCount")}`, {
						title: this.getView().getModel("i18n").getProperty("excelAdviseTitle")
					});
			}
			if (countSuccess === 0) {
				MessageBox.error(this.getView().getModel("i18n").getProperty("excelCriteriaError"), {
					title: this.getView().getModel("i18n").getProperty("excel404Title")
				});
			}
			// let model = this.getOwnerComponent().getModel("mLocalProductoStockVentas")
			// model.refresh();
			OData.read(sPathPrev, {
				success: function (response) {
					var oLocalVentas = [];
					response.results.forEach(function (venta) {
						oLocalVentas.push({
							IDLOCAL: that.oLocal.IDLOCAL,
							NOMBRELOCAL: that.oLocal.NOMBRELOCAL,
							IDVENTAS: venta.IDVENTAS,
							PRODUCTOVENDIDO: venta.PRODUCTOVENDIDO
						});
					});
					var oApp1DetailModel = that.getOwnerComponent().getModel("mLocalProductoStockVentas");
					oApp1DetailModel.setProperty("/mLocalProductoStockVentas", oLocalVentas);
				},
				error: function (error) {
					MessageBox.error(that.getView().getModel("i18n").getProperty("readError"));
				}
			});
			this.getView().getModel("excelModel").setData([]);
			this.openDialog.close();
		},
		closeUploadExcelDialog: function () {
			this.getView().getModel("excelModel").setData([]);
			this.openDialog.close();
		},
		handleListPress: function (oEvent) {
			var OData = this.getView().getModel();
			var selectedID = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("IDLOCAL");
			this.oLocal.IDLOCAL = selectedID;
			this.oLocal.NOMBRELOCAL = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("NOMBRELOCAL");
			var that = this;
			var sPath = `/LOCALSet('${selectedID}')/TOVENTAS`;
			var loadLocalVentasData = new Promise(function (resolve, reject) {
				OData.read(sPath, {
					success: function (response) {
						var oLocalVentas = [];
						response.results.forEach(function (venta) {
							oLocalVentas.push({
								IDLOCAL: that.oLocal.IDLOCAL,
								NOMBRELOCAL: that.oLocal.NOMBRELOCAL,
								IDVENTAS: venta.IDVENTAS,
								PRODUCTOVENDIDO: venta.PRODUCTOVENDIDO
							});
						});
						var oApp1DetailModel = that.getOwnerComponent().getModel("mLocalProductoStockVentas");
						oApp1DetailModel.setProperty("/mLocalProductoStockVentas", oLocalVentas);
						resolve();
					},
					error: function (error) {
						console.error(that.getView().getModel("i18n").getProperty("ventasReadError"),
							error);
						MessageBox.error(that.getView().getModel("i18n").getProperty("readError"));
					}
				});
			});
			loadLocalVentasData.then(function () {
				var oView = that.getView();
				that.bus.publish("flexible", "setDetailPage");
			});
		},
	});
});