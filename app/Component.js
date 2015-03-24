jQuery.sap.declare("demo.Component");
jQuery.sap.require("demo.Router");

sap.ui.core.UIComponent.extend("demo.Component", {
    metadata: {
        name: "OpenUI5 Demo",
        includes: [],
        dependencies: {
            libs: ["sap.m", "sap.ui.layout"],
            components: []
        },
        rootView: "demo.view.App",
        config: {
            eventService: {
                url: "http://example.com/api/odata"
            }
        },
        routing: {
            config: {
                routerClass: demo.Router,
                viewType: "XML",
                viewPath: "demo.view",
                targetAggregation: "detailPages",
                clearTarget: false
            },
            routes: [
                {
                    pattern: "",
                    name: "main",
                    view: "Master",
                    targetAggregation: "masterPages",
                    targetControl: "splitApp",
                    subroutes: [
                        {
                            pattern: "{id}",
                            name: "event",
                            view: "Detail"
                        }
                    ]
                },
                {
                    name: "catchallMaster",
                    view: "Master",
                    targetAggregation: "masterPages",
                    targetControl: "splitApp",
                    subroutes: [
                        {
                            pattern: ":all*:",
                            name: "catchallDetail",
                            view: "NotFound",
                            transition: "show"
                        }
                    ]
                }
            ]
        }
    },

    init: function() {
        sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

        var mConfig = this.getMetadata().getConfig();

        var oModel = new sap.ui.model.odata.ODataModel(
            mConfig.eventService.url,
            true
        );
        oModel.setDefaultCountMode("None");
        this.setModel(oModel);

        // set device model (phone/desktop support)
        var deviceModel = new sap.ui.model.json.JSONModel({
            isTouch: sap.ui.Device.support.touch,
            isNoTouch: !sap.ui.Device.support.touch,
            isPhone: sap.ui.Device.system.phone,
            isNoPhone: !sap.ui.Device.system.phone,
            listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
            listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
        });

        deviceModel.setDefaultBindingMode("OneWay"); // only set once, then read-only
        this.setModel(deviceModel, "device");

        this.getRouter().initialize();
    }
});