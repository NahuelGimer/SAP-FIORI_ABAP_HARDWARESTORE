sap.ui.define([
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/Device",
	'sap/ui/core/message/Message',
	'sap/ui/core/library',
	'sap/ui/core/Core',
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	'sap/ui/core/Element',
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/Log",
	"../model/formatter"
], function (MessagePopover, MessageItem, MessageToast, MessageBox, Device, Message, coreLibrary, Core, Controller, History,
	UIComponent, Element, JSONModel, Filter, FilterOperator, Log, formatter) {
	"use strict";
	return Controller.extend("constants.model.routes.controllers.App2", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			var oModel = new sap.ui.model.json.JSONModel([]);
			var LOCALID = [];
			var PRODUCTID = [];
			this.Odata = this.getView().getModel();
			this.OData = this.getView().getModel();
			this.getView().setModel(oModel, "excelModel");
			this.oLocalProducto = {
				IDLOCAL: "",
				NOMBRELOCAL: "",
				IDPRODUCTO: "",
				NOMBREPRODUCTO: "",
				VALOR: ""
			};
			var productoStockModel = {
				PRODUCTO: {
					IDPRODUCTO: "",
					NOMBREPRODUCTO: "",
					VALOR: ""
				},
				STOCK: {
					IDSTOCK: "",
					CANTIDADSTOCK: ""
				}
			};
			var oProductoStockModel = new JSONModel(productoStockModel);
			this.getView().setModel(oProductoStockModel, "mPRODUCTOSTOCK");
			Device.orientation.attachHandler(this.onOrientationChange, this);
			this.oView = this.getView();
			this._oMessageManager = Core.getMessageManager();
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
			var oSplitContainer = this.byId("SplitAppDemo");
			var oCurrentMasterPage = oSplitContainer.getCurrentMasterPage();
			if (oCurrentMasterPage.getId() !== this.createId("master")) {
				this.onPressMasterBack();
			} else {
				return;
			}
		},
		onFilter: function () {
			var filters = [];
			var Nom = this.getView().byId("SearchField").getValue();
			var tabla = this.getView().byId("wdqqdw");
			var binding = tabla.getBinding("items");
			if (Nom && Nom.length > 0) {
				filters.push(new Filter("NOMBRELOCAL", FilterOperator.Contains, Nom));
			};
			binding.filter(filters);
		},
		onFilter1: function () {
			var filters = [];
			var PrevMenu = this.oLocalProducto.IDLOCAL;
			var Nom = this.getView().byId("SearchField1").getValue();
			if (PrevMenu && PrevMenu.length > 0) {
				filters.push(new Filter("IDLOCAL", FilterOperator.Contains, PrevMenu));
				if (Nom && Nom.length > 0) {
					filters.push(new Filter("NOMBREPRODUCTO", FilterOperator.Contains, Nom));
				}
				var tabla = this.getView().byId("EQWEQ");
				var binding = tabla.getBinding("items");
				binding.filter(filters);
			}
		},
		onFilter2: function () {
			this.getOwnerComponent().getModel("mLocalProductoStockVentas").setData([]);
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
					workbook.SheetNames.forEach(function (sheetName) {
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
						for (var i in excelData) {
							excelData[i].IDLOCAL = excelData[i]["IDLOCAL"];
							excelData[i].NOMBRELOCAL = excelData[i]["NOMBRELOCAL"]
							excelData[i].IDPRODUCTO = excelData[i]["IDPRODUCTO"]
							excelData[i].NOMBREPRODUCTO = excelData[i]["NOMBREPRODUCTO"]
							excelData[i].VALOR = excelData[i]["VALOR"]
							excelData[i].IDSTOCK = excelData[i]["IDSTOCK"]
							excelData[i].CANTIDADSTOCK = excelData[i]["CANTIDADSTOCK"]
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
			if (!this.openDialog1) {
				this.openDialog1 = sap.ui.xmlfragment("IdFragment1", "NGI1.Ferreterias.utils.fragments.App2DialogUploadExcel", this);
				oView.addDependent(this.openDialog1);
			}
			this.openDialog1.open();
		},
		uploadExcelFiles: function (oEvent) {
			var OData = this.getView().getModel();
			var that = this;
			var filesData = this.getView().getModel("excelModel").getData();
			var sPath = "/LOCALSet";
			var sPathC1 = "/PRODUCTOSet";
			var sPathCC1 = "/STOCKSet";
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
						IDPRODUCTO: "",
						IDLOCAL: "",
						NOMBREPRODUCTO: "",
						VALOR: ""
					},
					sDataCC1: {
						IDSTOCK: "",
						IDPRODUCTO: "",
						CANTIDADSTOCK: ""
					}
				};
				var charRegex = /^[^\s].*[^\s]$/;
				var numericRegex = /^[0-9]+$/;
				if (fileData.IDLOCAL === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedIDLOCAL"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.IDLOCAL.includes(" ") || fileData.IDLOCAL.startsWith("0")) {
					console.log(this.getView().getModel("i18n").getProperty("spaceOrInitZerosIDLOCAL"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (!numericRegex.test(fileData.IDLOCAL)) {
					console.log(this.getView().getModel("i18n").getProperty("numberIDLOCAL"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.IDLOCAL < 1 || fileData.IDLOCAL > 999) {
					console.log(this.getView().getModel("i18n").getProperty("rangeIDLOCAL"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.NOMBRELOCAL === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedNOMBRELOCAL"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (!charRegex.test(fileData.NOMBRELOCAL) || fileData.NOMBRELOCAL.trim() === '') {
					console.log(this.getView().getModel("i18n").getProperty("charNOMBRELOCAL"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.NOMBRELOCAL.length < 2 || fileData.NOMBRELOCAL.length > 30) {
					console.log(this.getView().getModel("i18n").getProperty("rangeNOMBRELOCAL"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.IDPRODUCTO === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedIDPRODUCTO"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.IDPRODUCTO.includes(" ") || fileData.IDPRODUCTO.startsWith("0")) {
					console.log(this.getView().getModel("i18n").getProperty("spaceOrInitZerosIDPRODUCTO"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (!numericRegex.test(fileData.IDPRODUCTO)) {
					console.log(this.getView().getModel("i18n").getProperty("numberIDPRODUCTO"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.IDPRODUCTO < 1 || fileData.IDPRODUCTO > 999) {
					console.log(this.getView().getModel("i18n").getProperty("rangeIDPRODUCTO"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.NOMBREPRODUCTO === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedNOMBREPRODUCTO"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (!charRegex.test(fileData.NOMBREPRODUCTO) || fileData.NOMBREPRODUCTO.trim() === '') {
					console.log(this.getView().getModel("i18n").getProperty("charNOMBREPRODUCTO"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.NOMBREPRODUCTO.length < 2 || fileData.NOMBREPRODUCTO.length > 30) {
					console.log(this.getView().getModel("i18n").getProperty("rangeNOMBREPRODUCTO"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.VALOR === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedVALOR"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.VALOR.includes(" ")) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedVALOR"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (!numericRegex.test(fileData.VALOR)) {
					console.log(this.getView().getModel("i18n").getProperty("spaceVALOR"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.VALOR < 0 || fileData.VALOR > 9999999) {
					console.log(this.getView().getModel("i18n").getProperty("spaceVALOR"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.IDSTOCK === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedIDSTOCK"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.IDSTOCK.includes(" ") || fileData.IDSTOCK.startsWith("0")) {
					console.log(this.getView().getModel("i18n").getProperty("spaceOrInitZerosIDSTOCK"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (!numericRegex.test(fileData.IDSTOCK)) {
					console.log(this.getView().getModel("i18n").getProperty("numberIDSTOCK"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.IDSTOCK < 1 || fileData.IDSTOCK > 999) {
					console.log(this.getView().getModel("i18n").getProperty("rangeIDSTOCK"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.CANTIDADSTOCK === undefined) {
					console.log(this.getView().getModel("i18n").getProperty("undefinedCANTIDADSTOCK"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.CANTIDADSTOCK.includes(" ")) {
					console.log(this.getView().getModel("i18n").getProperty("spaceCANTIDADSTOCK"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (!numericRegex.test(fileData.CANTIDADSTOCK)) {
					console.log(this.getView().getModel("i18n").getProperty("numberCANTIDADSTOCK"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				if (fileData.CANTIDADSTOCK < 0 || fileData.CANTIDADSTOCK > 99999) {
					console.log(this.getView().getModel("i18n").getProperty("rangeCANTIDADSTOCK"), i);
					failedRecords.push({
						registro: i,
						IDLOCAL: fileData.IDLOCAL,
						IDPRODUCTO: fileData.IDPRODUCTO,
						IDSTOCK: fileData.IDSTOCK
					});
					continue;
				}
				countSuccess++;
				data.sData.IDLOCAL = fileData.IDLOCAL.padStart(3, '0');
				data.sData.NOMBRELOCAL = fileData.NOMBRELOCAL;
				data.sDataC1.IDPRODUCTO = fileData.IDPRODUCTO.padStart(3, '0');
				data.sDataC1.IDLOCAL = data.sData.IDLOCAL;
				data.sDataC1.NOMBREPRODUCTO =
					fileData.NOMBREPRODUCTO;
				data.sDataC1.VALOR = fileData.VALOR.padStart(7, '0');
				data.sDataCC1.IDSTOCK = fileData.IDSTOCK.padStart(3, '0');
				data.sDataCC1.IDPRODUCTO = data.sDataC1.IDPRODUCTO;
				data.sDataCC1.CANTIDADSTOCK =
					fileData.CANTIDADSTOCK.padStart(5, '0');
				OData.create(sPath, data.sData, {
					success: function (response) {
						successCreate[0] = true;
					},
					error: function (error) {
						console.log(this.getView().getModel("i18n").getProperty("localProductoStockCreateError"), error);
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
							console.log(this.getView().getModel("i18n").getProperty("productoStockCreateError"), error);
							successCreate[1] = false;
							let texto = error.responseText
							let errorStock = texto.indexOf(
								that.getView().getModel("i18n").getProperty("maxProducto"))
							if (errorStock) {
								MessageToast.show(that.getView().getModel("i18n").getProperty("productoError"));
							}
						}
					});
				}
				if (successCreate[1] = true) {
					OData.create(sPathCC1, data.sDataCC1, {
						success: function (response) {},
						error: function (error) {
							console.log(this.getView().getModel("i18n").getProperty("stockCreateError"), error);
							let texto = error.responseText
							let errorStock = texto.indexOf(
								that.getView().getModel("i18n").getProperty("maxStock"))
							if (errorStock) {
								MessageToast.show(that.getView().getModel("i18n").getProperty("stockError"));
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
			this.getView().getModel("excelModel").setData([]);
			this.openDialog1.close();
		},
		closeUploadExcelDialog: function () {
			this.getView().getModel("excelModel").setData([]);
			this.openDialog1.close();
		},
		onExit: function () {
			Device.orientation.detachHandler(this.onOrientationChange, this);
		},
		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info(this.getView().getModel("i18n").getProperty("splitAppError"));
			}
			return result;
		},
		onPressMasterBack: function () {
			var oDetail1Page = this.getView().byId("detail");
			oDetail1Page.setTitle(this.getView().getModel("i18n").getProperty("productDetail"));
			this.getOwnerComponent().getModel("mLocalProductoStockVentas").setData([]);
			this.getSplitAppObj().backMaster();
		},
		onPressGoToMaster: function (oEvent) {
			var that = this;
			var filters = [];
			// var idLocal = ;
			this.oLocalProducto.IDLOCAL = oEvent.getSource().getBindingContext().getProperty("IDLOCAL");
			this.oLocalProducto.NOMBRELOCAL = oEvent.getSource().getBindingContext().getProperty("NOMBRELOCAL");
			var tabla = this.getView().byId("EQWEQ");
			var binding = tabla.getBinding("items");
			if (this.oLocalProducto.IDLOCAL && this.oLocalProducto.IDLOCAL.length > 0) {
				filters.push(new Filter("IDLOCAL", FilterOperator.Contains, this.oLocalProducto.IDLOCAL));
			}
			binding.filter(filters);
			var oMaster2Page = this.getView().byId("master2");
			oMaster2Page.setTitle(this.getView().getModel("i18n").getProperty("localProducts") + this.oLocalProducto.NOMBRELOCAL);
			binding.attachEvent("dataReceived", function () {
				that.getSplitAppObj().toMaster(that.createId("master2"));
			});
		},
		onPressListItem1: function (oEvent) {
			var OData = this.getView().getModel();
			var that = this;
			var selectedID = oEvent.getSource().getBindingContext().getProperty("IDPRODUCTO");
			this.oLocalProducto.IDPRODUCTO = selectedID;
			this.oLocalProducto.NOMBREPRODUCTO = oEvent.getSource().getBindingContext().getProperty("NOMBREPRODUCTO");
			this.oLocalProducto.VALOR = oEvent.getSource().getBindingContext().getProperty("VALOR");
			var sPath = `/PRODUCTOSet('${selectedID}')/TOSTOCK`;
			var oDetail1Page = this.getView().byId("detail");
			oDetail1Page.setTitle(this.getView().getModel("i18n").getProperty("productDetail") + this.oLocalProducto.NOMBREPRODUCTO + this.getView()
				.getModel("i18n").getProperty("ofLocal") + this.oLocalProducto.NOMBRELOCAL);
			OData.read(sPath, {
				success: (response) => {
					var oLocalProductoStock = []
					oLocalProductoStock.push({
						IDLOCAL: that.oLocalProducto.IDLOCAL,
						NOMBRELOCAL: that.oLocalProducto.NOMBRELOCAL,
						IDPRODUCTO: that.oLocalProducto.IDPRODUCTO,
						NOMBREPRODUCTO: that.oLocalProducto.NOMBREPRODUCTO,
						VALOR: that.oLocalProducto.VALOR,
						IDSTOCK: response.IDSTOCK,
						CANTIDADSTOCK: response.CANTIDADSTOCK
					});
					var oApp3 = this.getOwnerComponent().getModel("mLocalProductoStockVentas");
					oApp3.setProperty("/mLocalProductoStockVentas", oLocalProductoStock);
				},
				error: (error) => {
					this.getOwnerComponent().getModel("mLocalProductoStockVentas").setData([]);
					console.log(this.getView().getModel("i18n").getProperty("stockCreateError"), error);
				}
			});
			var oView = this.getView();
		},
		onOpenPopoverDialog: function () {
			if (!this.oMPDialog) {
				this.oMPDialog = this.loadFragment({
					name: "NGI1.Ferreterias.utils.fragments.App2DialogAddProduct",
					controller: this
				});
			}
			this.oMPDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				var sNombreLocal = this.oLocalProducto.NOMBRELOCAL;
				var oModel = this.getView().getModel();
				oModel.setProperty("/NOMBRELOCAL", sNombreLocal);
				var sDialogTitle = this.getView().getModel("i18n").getProperty("addProductToLocal") + sNombreLocal;
				this.oDialog.setTitle(sDialogTitle);
				var oInput1 = this.byId("input1");
				var oInput4 = this.byId("input4");
				if (oInput1 && oInput4) {
					oInput1.setValue(this.oLocalProducto.IDLOCAL);
					oInput4.setValue(this.oLocalProducto.NOMBRELOCAL);
				}
				this.oDialog.open();
				this._oMessageManager.registerObject(this.byId("formContainer"), true);
			}.bind(this));
			this.getView().getModel("mPRODUCTOSTOCK").setProperty("/PRODUCTO", {});
			this.getView().getModel("mPRODUCTOSTOCK").setProperty("/STOCK", {});
		},
		_openDialogAddProduct: function () {
			var that = this;
			var OData = this.getView().getModel();
			var sPathC1 = "/PRODUCTOSet";
			var sPathCC1 = "/STOCKSet";
			var charRegex = /^[^\s].*[^\s]$/;
			var numericRegex = /^[0-9]+$/;
			var noZeroRegex = /^0+/;
			var idLocal = this.oLocalProducto.IDLOCAL;
			var idProducto = this.getView().getModel("mPRODUCTOSTOCK").getProperty("/PRODUCTO/IDPRODUCTO");
			var nombreProducto = this.getView().getModel("mPRODUCTOSTOCK").getProperty("/PRODUCTO/NOMBREPRODUCTO");
			var valor = this.getView().getModel("mPRODUCTOSTOCK").getProperty("/PRODUCTO/VALOR");
			var cantidadStock = this.getView().getModel("mPRODUCTOSTOCK").getProperty("/STOCK/CANTIDADSTOCK");
			var successCreate = [false, false];
			var data = {
				sDataC1: {
					IDPRODUCTO: idProducto,
					IDLOCAL: idLocal,
					NOMBREPRODUCTO: nombreProducto,
					VALOR: valor
				},
				sDataCC1: {
					IDSTOCK: idProducto,
					IDPRODUCTO: idProducto,
					CANTIDADSTOCK: cantidadStock
				}
			};
			OData.setUseBatch(false);
			if (idProducto === undefined) {
				console.log(
					this.getView().getModel("i18n").getProperty("undefined2IDPRODUCTO"));
			} else {
				if (idProducto.includes(" ") || idProducto.startsWith("0")) {
					console.log(
						this.getView().getModel("i18n").getProperty("spaceOrInitZeros2IDPRODUCTO"));
				} else {
					if (!numericRegex.test(idProducto)) {
						console.log(
							this.getView().getModel("i18n").getProperty("number2IDPRODUCTO"));
					} else {
						if (idProducto < 1 || idProducto > 1000) {
							console.log(
								this.getView().getModel("i18n").getProperty("range2IDPRODUCTO"));
						} else {
							if (nombreProducto === undefined) {
								console.log(
									this.getView().getModel("i18n").getProperty("undefined2NOMBREPRODUCTO"));
							} else {
								if (!charRegex.test(nombreProducto) || nombreProducto.trim() === '') {
									console.log(
										this.getView().getModel("i18n").getProperty("spaceOrInitZeros2NOMBREPRODUCTO"));
								} else {
									if (nombreProducto.length < 2 || nombreProducto.length > 30) {
										console.log(
											this.getView().getModel("i18n").getProperty("range2NOMBREPRODUCTO"));
									} else {
										if (valor === undefined) {
											console.log(
												this.getView().getModel("i18n").getProperty("undefined2VALOR"));
										} else {
											if (valor.includes(" ")) {
												console.log(
													this.getView().getModel("i18n").getProperty("space2VALOR"));
											} else {
												if (!numericRegex.test(valor)) {
													console.log(
														this.getView().getModel("i18n").getProperty("number2VALOR"));
												} else {
													if (valor < 0 || valor > 9999999) {
														console.log(
															this.getView().getModel("i18n").getProperty("range2VALOR"));
													} else {
														if (cantidadStock === undefined) {
															console.log(
																this.getView().getModel("i18n").getProperty("undefined2CANTIDADSTOCK"));
														} else {
															if (cantidadStock.includes(" ")) {
																console.log(
																	this.getView().getModel("i18n").getProperty("space2CANTIDADSTOCK"));
															} else {
																if (!numericRegex.test(cantidadStock)) {
																	console.log(
																		this.getView().getModel("i18n").getProperty("number2CANTIDADSTOCK"));
																} else {
																	if (cantidadStock < 0 || cantidadStock > 99999) {
																		console.log(
																			this.getView().getModel("i18n").getProperty("range2CANTIDADSTOCK"));
																	} else {
																		data.sDataC1.VALOR = parseInt(valor, 10).toString().replace(noZeroRegex, '').padStart(1, '0')
																		data.sDataCC1.CANTIDADSTOCK = parseInt(cantidadStock, 10).toString().replace(noZeroRegex, '').padStart(1,
																			'0');
																		OData.create(sPathC1, data.sDataC1, {
																			success: function (response) {
																				successCreate[0] = true;
																			},
																			error: function (error) {
																				let texto = error.responseText
																				let errorStock = texto.indexOf(
																						that.getView().getModel("i18n").getProperty("maxProducto")) !==
																					1
																				if (errorStock) {
																					MessageToast.show(that.getView().getModel("i18n").getProperty("productoError"));
																				}
																			},
																		});
																		if (successCreate[0] = true) {
																			OData.create(sPathCC1, data.sDataCC1, {
																				success: function (response) {
																					successCreate[1] = true;
																					if (successCreate[0] === true && successCreate[1] === true) {
																						MessageBox.success(that.getView().getModel("i18n").getProperty("addProductSuccess"), {
																							title: that.getView().getModel("i18n").getProperty("addTitleProductSuccess")
																						});
																						that.oDialog.close();
																					}
																				},
																				error: function (error) {
																					let texto = error.responseText
																					let errorStock = texto.indexOf(
																						that.getView().getModel("i18n").getProperty("maxStock")) !== 1
																					if (errorStock) {
																						MessageToast.show(that.getView().getModel("i18n").getProperty("stockError"));
																					}
																				},
																			});
																		}
																	}

																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		},
		_closeDialogAddProduct: function () {
			this.oDialog.close();
		},
		deleteProduct: function (oEvent) {
			var that = this;
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext().getPath();
			var oBindingContext = oItem.getBindingContext();
			var selectedId = oBindingContext.getProperty("IDPRODUCTO");
			var sPathNext = `/STOCKSet('${selectedId}')`
			var oDialog = new sap.m.Dialog({
				title: this.getView().getModel("i18n").getProperty("deleteProductTitle"),
				type: "Message",
				content: new sap.m.Text({
					text: this.getView().getModel("i18n").getProperty("deleteProductMessage")
				}),
				beginButton: new sap.m.Button({
					text: "Eliminar",
					type: "Negative",
					press: function () {
						var OData = this.getView().getModel();
						OData.setUseBatch(false);
						OData.remove(sPath, {
							success: function () {
								that.getOwnerComponent().getModel("mLocalProductoStockVentas").setData([]);
								OData.remove(sPathNext, {
									success: function () {},
									error: function () {
										console.log(error);
									}
								});
							}
						});
						oList.attachEventOnce("updateFinished", oList.focus, oList);
						oDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancelar",
					press: function () {
						oDialog.close();
					}
				})
			});
			oDialog.open();
		},
	});
});