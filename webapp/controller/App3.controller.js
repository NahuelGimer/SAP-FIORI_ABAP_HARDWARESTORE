sap.ui.define([
	'sap/m/MessageToast',
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	'sap/ui/core/Fragment',
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter"
], function (MessageToast, MessageBox, Controller, History, UIComponent, Fragment, syncStyleClass,
	CoreLibrary, JSONModel, Filter, FilterOperator, formatter) {
	"use strict";
	return Controller.extend("constants.model.routes.controllers.App3", {
		formatter: formatter,
		onInit: function () {
			var oModel = new sap.ui.model.json.JSONModel([]);
			var that = this;
			this.OData = this.getView().getModel();
			this.oLocalProductoStockVentas = {
				IDLOCAL: "",
				NOMBRELOCAL: "",
				IDPRODUCTO: "",
				NOMBREPRODUCTO: "",
				VALOR: "",
				IDSTOCK: "",
				CANTIDADSTOCK: "",
				IDVENTAS: "",
				PRODUCTOVENDIDO: ""
			};
			var stockModel = {
				STOCK: {
					CANTIDADSTOCKSELLED: ""
				}
			};
			var oStockModel = new JSONModel(stockModel);
			this.getView().setModel(oStockModel, "mSTOCK");
		},
		onMaxRecordsChange: function (oEvent) {
			var oTable = this.getView().byId("productsTable");
			var oBinding = oTable.getBinding("rows");
			var newValue = oEvent.getParameter("value");
			var values = newValue.split("-");
			if (values.length === 2) {
				var minValue = parseFloat(values[0]);
				var maxValue = parseFloat(values[1]);
				if (!isNaN(minValue) && !isNaN(maxValue) && minValue <= maxValue) {
					oBinding.filter([
						new sap.ui.model.Filter("IDLOCAL", sap.ui.model.FilterOperator.BT, minValue, maxValue)
					]);
					return;
				}
			}
			oBinding.filter([]);
		},
		onMaxRecordsChange1: function (oEvent) {
			var oTable = this.getView().byId("productsTable1");
			var oBinding = oTable.getBinding("rows");
			var newValue = oEvent.getParameter("value");
			var values = newValue.split("-");
			if (values.length === 2) {
				var minValue = parseFloat(values[0]);
				var maxValue = parseFloat(values[1]);
				if (!isNaN(minValue) && !isNaN(maxValue) && minValue <= maxValue) {
					oBinding.filter([
						new sap.ui.model.Filter("IDPRODUCTO", sap.ui.model.FilterOperator.BT, minValue, maxValue)
					]);
					return;
				}
			}
			oBinding.filter([]);
		},
		onMaxRecordsChange2: function (oEvent) {
			var oTable = this.getView().byId("productsTable2");
			var oBinding = oTable.getBinding("rows");
			var newValue = oEvent.getParameter("value");
			var values = newValue.split("-");
			if (values.length === 2) {
				var minValue = parseFloat(values[0]);
				var maxValue = parseFloat(values[1]);
				if (!isNaN(minValue) && !isNaN(maxValue) && minValue <= maxValue) {
					oBinding.filter([
						new sap.ui.model.Filter("IDSTOCK", sap.ui.model.FilterOperator.BT, minValue, maxValue)
					]);
					return;
				}
			}
			oBinding.filter([]);
		},
		onMaxRecordsChange3: function (oEvent) {
			var oTable = this.getView().byId("productsTable3");
			var oBinding = oTable.getBinding("rows");
			var newValue = oEvent.getParameter("value");
			var values = newValue.split("-");
			if (values.length === 2) {
				var minValue = parseFloat(values[0]);
				var maxValue = parseFloat(values[1]);
				if (!isNaN(minValue) && !isNaN(maxValue) && minValue <= maxValue) {
					oBinding.filter([
						new sap.ui.model.Filter("IDVENTAS", sap.ui.model.FilterOperator.BT, minValue, maxValue)
					]);
					return;
				}
			}
			oBinding.filter([]);
		},
		onNavPress: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteMaster", {}, true);
		},
		onFilter: function () {
			var filters = [];
			var Id = this.getView().byId("SearchField24").getValue();
			var Nom = this.getView().byId("SearchField34").getValue();
			var tabla = this.getView().byId("productsTable");
			var binding = tabla.getBinding("rows");
			if (Id && Id.length > 0 && Id != 0) {
				filters.push(new Filter("IDLOCAL", FilterOperator.Contains, Id.padStart(3, '0')));
			};
			if (Nom && Nom.length > 0) {
				filters.push(new Filter("NOMBRELOCAL", FilterOperator.Contains, Nom));
			};
			binding.filter(filters);
		},
		onFilter1: function () {
			var filters = [];
			var IdF = this.getView().byId("SearchField221").getValue();
			var Id = this.getView().byId("SearchField32").getValue();
			var Nom = this.getView().byId("SearchField22").getValue();
			var Num = this.getView().byId("SearchField22e").getValue();
			var tabla = this.getView().byId("productsTable1");
			var binding = tabla.getBinding("rows");
			if (IdF && IdF.length > 0 && IdF != 0) {
				filters.push(new Filter("IDLOCAL", FilterOperator.Contains, IdF.padStart(3, '0')));
			};
			if (Id && Id.length > 0 && Id != 0) {
				filters.push(new Filter("IDPRODUCTO", FilterOperator.Contains, Id.padStart(3, '0')));
			};
			if (Nom && Nom.length > 0) {
				filters.push(new Filter("NOMBREPRODUCTO", FilterOperator.Contains, Nom));
			};
			if (Num && Num.length > 0) {
				filters.push(new Filter("VALOR", FilterOperator.Contains, Num.padStart(7, '0')));
			};
			binding.filter(filters);
		},
		onFilter2: function () {
			var filters = [];
			var IdF = this.getView().byId("SearchField2211").getValue()
			var Id = this.getView().byId("SearchField2").getValue()
			var Num = this.getView().byId("SearchField2q").getValue()
			var tabla = this.getView().byId("productsTable2");
			var binding = tabla.getBinding("rows");
			if (IdF && IdF.length > 0 && IdF != 0) {
				filters.push(new Filter("IDPRODUCTO", FilterOperator.Contains, IdF.padStart(3, '0')));
			};
			if (Id && Id.length > 0 && Id != 0) {
				filters.push(new Filter("IDSTOCK", FilterOperator.Contains, Id.padStart(3, '0')));
			};
			if (Num && Num.length > 0) {
				filters.push(new Filter("CANTIDADSTOCK", FilterOperator.Contains, Num.padStart(5, '0')));
			};
			binding.filter(filters);
		},
		onFilter3: function () {
			var filters = [];
			var IdF = this.getView().byId("SearchField2241").getValue();
			var Id = this.getView().byId("SearchField29").getValue();
			var Nom = this.getView().byId("SearchField22311").getValue();
			var tabla = this.getView().byId("productsTable3");
			var binding = tabla.getBinding("rows");
			if (IdF && IdF.length > 0 && IdF != 0) {
				filters.push(new Filter("IDLOCAL", FilterOperator.Contains, IdF.padStart(3, '0')));
			};
			if (Id && Id.length > 0 && Id != 0) {
				filters.push(new Filter("IDVENTAS", FilterOperator.Contains, Id.padStart(3, '0')));
			};
			if (Nom && Nom.length > 0) {
				filters.push(new Filter("PRODUCTOVENDIDO", FilterOperator.Contains, Nom));
			};
			binding.filter(filters);
		},
		handleWizard: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			oHistory.aCustomData = [{
				currentController: this
			}];
			oRouter.navTo("RouteApp3Wizard");
		},
	});
})