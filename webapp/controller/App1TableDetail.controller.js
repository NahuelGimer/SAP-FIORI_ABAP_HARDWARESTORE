sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"../model/formatter"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, formatter) {
	"use strict";
	return Controller.extend("constants.model.routes.controllers.App1TableDetail", {
		formatter: formatter,
		onInit: function (page) {
			this.bus = this.getOwnerComponent().getEventBus();
		},
		onFilter: function () {
			var filters = [];
			var Nom = this.getView().byId("SearchField2").getValue();
			var Id = this.getView().byId("SearchField3").getValue();
			var tabla = this.getView().byId("productsTableDetail");
			var binding = tabla.getBinding("items");
			if (Id && Id.length > 0 && Id != 0) {
				filters.push(new Filter("IDVENTAS", FilterOperator.Contains, Id.padStart(3, '0')));
			};
			if (Nom && Nom.length > 0) {
				filters.push(new Filter("PRODUCTOVENDIDO", FilterOperator.Contains, Nom));
			};
			binding.filter(filters);
		},
	});
});