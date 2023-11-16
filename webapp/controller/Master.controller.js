sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"../model/formatter"
], function (Controller, JSONModel, MessageToast, formatter) {
	"use strict";
	return Controller.extend("constants.model.routes.controllers.Master", {
		formatter:formatter,
		onInit: function () {
		},
		toApp1: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.clearGeneralModel();
			oRouter.navTo("RouteApp1");
		},
		toApp2: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.clearGeneralModel();
			oRouter.navTo("RouteApp2");
		},
		toApp3: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteApp3");
		},
		toApp4: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteApp4");
		},
		toApp5: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteApp5");
		},
		clearGeneralModel: function () {
			this.getOwnerComponent().getModel("mLocalProductoStockVentas").setData([]);
		},
	})
})