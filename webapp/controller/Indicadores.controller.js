sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.prototipo.controller.Indicadores", {
		handleRouteMatched: function(oEvent) {
			var sAppId = "App60b948b848c4ce28367be19d";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		_onButtonPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("MainMenu", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		applyFiltersAndSorters: function(sControlId, sAggregationName, chartBindingInfo) {
			if (chartBindingInfo) {
				var oBindingInfo = chartBindingInfo;
			} else {
				var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			}
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		updateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		createFiltersAndSorters: function() {
			this.mBindingOptions = {};
			var oBindingData, aPropertyFilters;
			oBindingData = {};
			oBindingData.filters = [];
			aPropertyFilters = [];

			aPropertyFilters.push(new sap.ui.model.Filter("Rango", "EQ", "12"));
			oBindingData.filters.push(new sap.ui.model.Filter(aPropertyFilters, true));

			this.updateBindingOptions("sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19", oBindingData);
			oBindingData = {};
			oBindingData.filters = [];
			aPropertyFilters = [];

			aPropertyFilters.push(new sap.ui.model.Filter("Rango", "EQ", "6"));
			oBindingData.filters.push(new sap.ui.model.Filter(aPropertyFilters, true));

			this.updateBindingOptions("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569", oBindingData);
			oBindingData = {};
			oBindingData.filters = [];
			aPropertyFilters = [];

			aPropertyFilters.push(new sap.ui.model.Filter("Rango", "EQ", "3"));
			oBindingData.filters.push(new sap.ui.model.Filter(aPropertyFilters, true));

			this.updateBindingOptions("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652", oBindingData);
			oBindingData = {};
			oBindingData.filters = [];
			aPropertyFilters = [];

			aPropertyFilters.push(new sap.ui.model.Filter("Rango", "EQ", "12"));
			oBindingData.filters.push(new sap.ui.model.Filter(aPropertyFilters, true));

			this.updateBindingOptions("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953", oBindingData);
			oBindingData = {};
			oBindingData.filters = [];
			aPropertyFilters = [];

			aPropertyFilters.push(new sap.ui.model.Filter("Rango", "EQ", "6"));
			oBindingData.filters.push(new sap.ui.model.Filter(aPropertyFilters, true));

			this.updateBindingOptions("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151", oBindingData);
			oBindingData = {};
			oBindingData.filters = [];
			aPropertyFilters = [];

			aPropertyFilters.push(new sap.ui.model.Filter("Rango", "EQ", "3"));
			oBindingData.filters.push(new sap.ui.model.Filter(aPropertyFilters, true));

			this.updateBindingOptions("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263", oBindingData);

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Indicadores").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var oView = this.getView(),
				oData = {},
				self = this;
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "staticDataModel");
			self.oBindingParameters = {};

			oData["sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19"] = {};

			oData["sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19'] = {
				"path": "/ProveedorMonto2Set",
				"parameters": {}
			};

			oData["sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569"] = {};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569'] = {
				"path": "/ProveedorMonto2Set",
				"parameters": {}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652"] = {};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652'] = {
				"path": "/ProveedorMonto2Set",
				"parameters": {}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-content-sap_chart_LineChart-1621566177179-z8097sfvlcnikld6tqeaep2n19_S19"] = {};

			oData["sap_m_Page_0-content-sap_chart_LineChart-1621566177179-z8097sfvlcnikld6tqeaep2n19_S19"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-content-sap_chart_LineChart-1621566177179-z8097sfvlcnikld6tqeaep2n19_S19'] = {
				"path": "/OrdenesMontoFechaSet",
				"parameters": {}
			};

			oData["sap_m_Page_0-content-sap_chart_LineChart-1621566177179-z8097sfvlcnikld6tqeaep2n19_S19"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953"] = {};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953'] = {
				"path": "/ProductoMonto2Set",
				"parameters": {}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151"] = {};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151'] = {
				"path": "/ProductoMonto2Set",
				"parameters": {}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263"] = {};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263"]["data"] = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];

			self.oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263'] = {
				"path": "/ProductoMonto2Set",
				"parameters": {}
			};

			oData["sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oView.getModel("staticDataModel").setData(oData, true);

			function dateDimensionFormatter(oDimensionValue, sTextValue) {
				var oValueToFormat = sTextValue !== undefined ? sTextValue : oDimensionValue;
				if (oValueToFormat instanceof Date) {
					var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
						style: "short"
					});
					return oFormat.format(oValueToFormat);
				}
				return oValueToFormat;
			}

			var aDimensions = oView.byId("sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-content-sap_chart_LineChart-1621566177179-z8097sfvlcnikld6tqeaep2n19_S19").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			this.mAggregationBindingOptions = {};
			this.createFiltersAndSorters();

		},
		onAfterRendering: function() {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19");
				var oParameters = oBindingParameters['sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19'];

				self.applyFiltersAndSorters("sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19", "data", oBindingParameters['sap_m_Page_0-content-sap_chart_PieChart-1622172126925-z8097sfvlcnikld6tqeaep2n19_S19']);

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569");
				var oParameters = oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569'];

				self.applyFiltersAndSorters("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569", "data", oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725907569']);

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652");
				var oParameters = oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652'];

				self.applyFiltersAndSorters("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652", "data", oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_PieChart-1622725949652']);

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-content-sap_chart_LineChart-1621566177179-z8097sfvlcnikld6tqeaep2n19_S19");
				var oParameters = oBindingParameters['sap_m_Page_0-content-sap_chart_LineChart-1621566177179-z8097sfvlcnikld6tqeaep2n19_S19'];

				oChart.bindData(oBindingParameters['sap_m_Page_0-content-sap_chart_LineChart-1621566177179-z8097sfvlcnikld6tqeaep2n19_S19']);

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953");
				var oParameters = oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953'];

				self.applyFiltersAndSorters("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953", "data", oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727314953']);

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151");
				var oParameters = oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151'];

				self.applyFiltersAndSorters("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151", "data", oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727501151']);

			});

			oView.getModel(undefined).getMetaModel().loaded().then(function() {
				oChart = oView.byId("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263");
				var oParameters = oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263'];

				self.applyFiltersAndSorters("sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263", "data", oBindingParameters['sap_m_Page_0-z8097sfvlcnikld6tqeaep2n19_S19-content-sap_chart_BarChart-1622727552263']);

			});

		}
	});
}, /* bExport= */ true);
