sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/unified/DateRange',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/library'
], function (Controller, XMLView, History, UIComponent, JSONModel, Toast, Filter, FilterOperator, DateRange, DateFormat, coreLibrary) {
	"use strict";
	var CalendarType = coreLibrary.CalendarType;
	var initDate = "";
	var lastDate = "";
	return Controller.extend("constants.model.routes.controllers.App4", {
		oFormatYyyymmdd: null,
		onInit: function () {
			this.oFormatYyyymmdd = DateFormat.getInstance({
				pattern: "yyyy-MM-dd",
				calendarType: CalendarType.Gregorian
			});
			this.getView().setModel(new JSONModel([]), "mSalesSelected");
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
		handleCalendarSelect: function (oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar.getSelectedDates()[0]);
		},
		_updateText: function (oSelectedDates) {
			var oSelectedDateFrom = this.byId("selectedDateFrom"),
				oSelectedDateTo = this.byId("seleDctedDateTo"),
				oDate;
			if (oSelectedDates) {
				oDate = oSelectedDates.getStartDate();
				if (oDate) {
					initDate = this.oFormatYyyymmdd.format(oDate);
					this.byId("initDateInput").setValue(initDate);
				}
				oDate = oSelectedDates.getEndDate();
				if (oDate) {
					lastDate = this.oFormatYyyymmdd.format(oDate);
					this.byId("lastDateInput").setValue(lastDate);
				}
			} else {
				initDate = "";
				lastDate = "";
			}
			console.log(initDate);
			console.log(lastDate);
		},
		onFilter: function () {
			var OData = this.getView().getModel();
			OData.setUseBatch(false);
			var that = this;
			var oFilters = [];
			var initDate = this.getView().byId("initDateInput").getValue();
			var lastDate = this.getView().byId("lastDateInput").getValue();
			var initDateParts = initDate.split("-");
			var initYear = initDateParts[0];
			var initMonth = initDateParts[1]
			var initDay = initDateParts[2]
			var lastDateParts = lastDate.split("-");
			var lastYear = lastDateParts[0];
			var lastMonth = lastDateParts[1]
			var lastDay = lastDateParts[2]
			var formattedInitDate = initYear + '-' + initMonth + '-' + initDay;
			var formattedLastDate = lastYear + '-' + lastMonth + '-' + lastDay;
			var tabla = this.getView().byId("productsTable");
			var binding = tabla.getBinding("items");
			oFilters.push(new sap.ui.model.Filter("DESDE", sap.ui.model.FilterOperator.GE, formattedInitDate));
			oFilters.push(new sap.ui.model.Filter("HASTA", sap.ui.model.FilterOperator.LE, formattedLastDate));
			var sPath = "/VENTASFSet";
			OData.read(sPath, {
				filters: oFilters,
				success: function (response) {
					that.getView().getModel("mSalesSelected").destroy();
					that.getView().setModel(new JSONModel(response), "mSalesSelected");
					var data = that.getView().getModel("mSalesSelected").getData();
					for (let i = 0; i < data.results.length; i++) {
						data.results[i].FECHAS = data.results[i].FECHAS.toString().substring(0, 16);
					}
					that.getView().getModel("mSalesSelected").setData(data);
				},
				error: function (error) {
					MessageBox.error(that.getView().getModel("i18n").getProperty("readError"));
				}
			});
		},
	});
});