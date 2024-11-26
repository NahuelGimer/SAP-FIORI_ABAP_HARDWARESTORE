sap.ui.define([
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"sap/ui/core/UIComponent",
		"../model/formatter"
	],
	function (MessageBox, MessageToast, Controller, Filter, FilterOperator, JSONModel, History, UIComponent, formatter) {
		"use strict";
		return Controller.extend("constants.model.routes.controllers.App3SellProductWizard", {
			formatter: formatter,
			onInit: function () {
				this._wizard = this.byId("wizardSellProduct");
				var oProduct = {
					productSelected: {
						IDLOCAL: "",
						NOMBRELOCAL: "",
						IDPRODUCTO: "",
						NOMBREPRODUCTO: "",
						IDSTOCK: "",
						CANTIDADSTOCK: ""
					}
				};
				var oModelProduct = new JSONModel(oProduct);
				this.getView().setModel(oModelProduct, "mSelectedProduct");
				var oDataValidations = {
					ValidatedStep: {
						ValidationStep3: "None",
					}
				};
				var oModelValidations = new JSONModel(oDataValidations);
				this.getView().setModel(oModelValidations, "mValidations");
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
			filterLocal: function () {
				var filters = [];
				var nomLocal = this.getView().byId("SearchField1").getValue();
				var tabla = this.getView().byId("localList");
				var binding = tabla.getBinding("items");
				if (nomLocal && nomLocal.length > 0) {
					filters.push(new Filter("NOMBRELOCAL", FilterOperator.Contains, nomLocal));
				}
				binding.filter(filters);
			},
			filterProduct: function () {
				var filters = [];
				var idLocal = this.getView().getModel("mSelectedProduct").getProperty("/productSelected/IDLOCAL");
				var nomProduct = this.getView().byId("SearchField2").getValue();
				var tabla = this.getView().byId("productList");
				var binding = tabla.getBinding("items");
				if (idLocal && idLocal.length > 0) {
					filters.push(new Filter("IDLOCAL", FilterOperator.Contains, idLocal));
					if (nomProduct && nomProduct.length > 0) {
						filters.push(new Filter("NOMBREPRODUCTO", FilterOperator.Contains, nomProduct));
					}
				}
				binding.filter(filters);
			},
			onLocal: function (oEvent) {
				var filters = [];
				var idLocal = oEvent.getSource().getBindingContext().getProperty("IDLOCAL");
				var nomLocal = oEvent.getSource().getBindingContext().getProperty("NOMBRELOCAL");
				var tabla = this.getView().byId("productList");
				var binding = tabla.getBinding("items");
				if (idLocal && idLocal.length > 0) {
					filters.push(new Filter("IDLOCAL", FilterOperator.Contains, idLocal));
				}
				this.getView().getModel("mSelectedProduct").setProperty("/productSelected/IDLOCAL", idLocal);
				this.getView().getModel("mSelectedProduct").setProperty("/productSelected/NOMBRELOCAL", nomLocal);
				binding.filter(filters);
				this._wizard.validateStep(this.byId("Step1"));
				this._wizard.invalidateStep(this.byId("Step3"));
			},
			onPressProducto: function (oEvent) {
				var that = this;
				var idProduct = oEvent.getSource().getBindingContext().getProperty("IDPRODUCTO");
				var nomProduct = oEvent.getSource().getBindingContext().getProperty("NOMBREPRODUCTO");
				this.getView().getModel("mSelectedProduct").setProperty("/productSelected/IDPRODUCTO", idProduct);
				this.getView().getModel("mSelectedProduct").setProperty("/productSelected/NOMBREPRODUCTO", nomProduct);
				var filters = [];
				var tabla = this.getView().byId("stockList");
				var binding = tabla.getBinding("items");
				if (idProduct && idProduct.length > 0) {
					filters.push(new Filter("IDPRODUCTO", FilterOperator.Contains, idProduct));
				};
				binding.filter(filters);
				var oModel = this.getView().getModel();
				var OData = this.getView().getModel();
				OData.setUseBatch(false);
				var selectedId = this.getView().getModel("mSelectedProduct").getProperty("/productSelected/IDPRODUCTO");
				var sPath = `/PRODUCTOSet('${selectedId}')/TOSTOCK`;
				OData.read(sPath, {
					success: function (response) {
						that.getView().getModel("mSelectedProduct").setProperty("/productSelected/IDSTOCK", response.IDSTOCK);
						that.getView().getModel("mSelectedProduct").setProperty("/productSelected/CANTIDADSTOCK", response.CANTIDADSTOCK);
						var oInputInit = that.getView().getModel("mSelectedProduct").getProperty("/productSelected/CANTIDADSTOCK").replace(/^(0+)/g,
							'').padStart(1, "0")

						that.byId("CANTIDADSTOCKFinal").setValue(oInputInit);
						binding.attachEvent("dataReceived", function () {
							that._wizard.validateStep(that.byId("Step2"));
						});
					},
					error: function (error) {}
				})
			},
			_onSuccess: function () {
				var oModel = this.getView().getModel();
				var OData = this.getView().getModel();
				var that = this;
				var selectedId = this.getView().getModel("mSelectedProduct").getProperty("/productSelected/IDPRODUCTO");
				var cantidadStockActual = this.getView().getModel("mSelectedProduct").getProperty("/productSelected/CANTIDADSTOCK")
				var cantidadStockToSell = this.byId("CANTIDADSTOCKSelled").getValue();
				var idLocal = this.getView().getModel("mSelectedProduct").getProperty("/productSelected/IDLOCAL");
				var nomProduct = this.getView().getModel("mSelectedProduct").getProperty("/productSelected/NOMBREPRODUCTO");
				var currentData = {
					"IDSTOCK": this.getView().getModel("mSelectedProduct").getProperty("/productSelected/IDSTOCK"),
					"IDPRODUCTO": this.getView().getModel("mSelectedProduct").getProperty("/productSelected/IDPRODUCTO"),
					"CANTIDADSTOCK": (cantidadStockActual - cantidadStockToSell).toString()
				}
				var initialCANTIDADSTOCK = 0
				var maxIdVentas = 0;
				var sPath = `/STOCKSet('${selectedId}')`
				var sPathNext = `/VENTASSet`
				var sPathNew = `/STOCKSet`
				OData.setUseBatch(false);
				OData.update(sPath, currentData, {
					success: function (response) {
						OData.create(sPathNew, currentData, {
							success: function (response) {
								OData.read(sPathNext, {
									success: function (response) {
										response.results.forEach(function (item) {
											var idVentas = parseInt(item.IDVENTAS, 10);
											if (idVentas > maxIdVentas) {
												maxIdVentas = idVentas;
											}
										});
										var newIdVentas = maxIdVentas + 1;
										var newVentasData = {
											"IDVENTAS": newIdVentas.toString(),
											"IDLOCAL": idLocal,
											"PRODUCTOVENDIDO": nomProduct
										};
										OData.create(sPathNext, newVentasData, {
											success: function (response) {
												MessageBox.success(that.getView().getModel("i18n").getProperty("sellWizardSuccess"), {
													title: that.getView().getModel("i18n").getProperty("sellSuccess"),
													actions: ["Nueva Venta", "Volver al Programa"],
													emphasizedAction: "Realizar Venta Nueva",
													onClose: function (oAction) {
														if (oAction === "Nueva Venta") {
															var oWizard = that.byId("wizardSellProduct")
															var oFirstStep = oWizard.getSteps()[0];
															oWizard.discardProgress(oFirstStep);
															oWizard.goToStep(oFirstStep);
															that._wizard.invalidateStep(that.byId("Step1"));
															that.byId("CANTIDADSTOCKSelled").setValue("0");
														}
														if (oAction === "Volver al Programa") {
															var oWizard = that.byId("wizardSellProduct")
															var oFirstStep = oWizard.getSteps()[0];
															oWizard.discardProgress(oFirstStep);
															oWizard.goToStep(oFirstStep);
															that._wizard.invalidateStep(that.byId("Step1"));
															that.byId("CANTIDADSTOCKSelled").setValue("0");
															var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
															var oHistory = sap.ui.core.routing.History.getInstance();
															oHistory.aCustomData = [{
																currentController: this
															}];
															that.onNavPress();
														}
													}.bind(this)
												});
											},
											error: function (error) {
												let texto = error.responseText
												let errorStock = texto.indexOf(
													that.getView().getModel("i18n").getProperty("maxVentas")) !== 1
												if (errorStock) {
													MessageToast.show(that.getView().getModel("i18n").getProperty("ventasError"));
												}
											}
										});
									},
									error: function (error) {
										MessageBox.error(that.getView().getModel("i18n").getProperty("readError"));
									}
								});
							},
							error: function (error) {
								let texto = error.responseText
								let errorStock = texto.indexOf(
									that.getView().getModel("i18n").getProperty("maxStock")) !== 1
								if (errorStock) {
									MessageToast.show(that.getView().getModel("i18n").getProperty("stockError"));
								}
							}
						});
					},
					error: function (error) {
						let texto = error.responseText
						let errorStock = texto.indexOf(that.getView().getModel("i18n").getProperty("noStock")) !== 1
						if (errorStock) {
							MessageToast.show(that.getView().getModel("i18n").getProperty("stockErrorToast"));
						}
					},
				});
			},
			WizardValidation: function () {
				var oInputFinal = this.byId("CANTIDADSTOCKFinal");
				var oInputCantidad = this.byId("CANTIDADSTOCKSelled");
				var oInputInitial = this.getView().getModel("mSelectedProduct").getProperty("/productSelected/CANTIDADSTOCK");
				var oInputInit = this.getView().getModel("mSelectedProduct").getProperty("/productSelected/CANTIDADSTOCK").replace(/^(0+)/g, '').padStart(
					1, "0");
				var cantidad = this.byId("CANTIDADSTOCKSelled").getValue();
				var isNumber = /^\d+$/.test(cantidad);
				if (!isNumber) {
					oInputCantidad.setValue("0");
					this.byId("CANTIDADSTOCKFinal").setValue(oInputInit);
				} else {
					var numero = parseInt(cantidad, 10);
					if (numero > 0) {
						oInputCantidad.setValue(numero.toString());
					}
				}
				var oInput = oInputInitial - cantidad;
				oInputFinal.setValue(oInput);
				if (cantidad < 1) {
					let errorStock = texto.indexOf(that.getView().getModel("i18n").getProperty("noStock")) !== 1
					if (errorStock) {
						MessageToast.show(that.getView().getModel("i18n").getProperty("stockErrorToast"));
					}
				} else if (cantidad > 0) {
					this._wizard.validateStep(this.byId("Step3"));
				} else {
					MessageToast.show(this.getView().getModel("i18n").getProperty("stockErrorToast"));
					this._wizard.invalidateStep(this.byId("Step3"));
				}
				this.getView().getModel("mValidations").setProperty("/ValidatedStep/ValidationStep3", "None");
			},
			_handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
				var that = this;
				MessageBox[sMessageBoxType](sMessage, {
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					title: that.getView().getModel("i18n").getProperty("sellCancel"),
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.YES) {
							var oWizard = that.byId("wizardSellProduct")
							var oFirstStep = oWizard.getSteps()[0];
							oWizard.discardProgress(oFirstStep);
							oWizard.goToStep(oFirstStep);
							this._wizard.invalidateStep(that.byId("Step1"));
							this._wizard.invalidateStep(that.byId("Step2"));
							this._wizard.invalidateStep(that.byId("Step3"));
							this.onReturn();
						}
					}.bind(this)
				});
			},
			onCancel: function () {
				var message = this.getView().getModel("i18n").getProperty("sellWizardCancel")
				this._handleMessageBoxOpen(message, "warning");
			},
			onReturn: function () {
				this.onNavPress();
			}
		});
	});
