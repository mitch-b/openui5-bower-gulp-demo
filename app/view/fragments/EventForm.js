jQuery.sap.require("demo.util.Controller");
jQuery.sap.require("demo.view.fragments.SearchCustomersDialog");
jQuery.sap.require("demo.view.fragments.SearchProductsDialog");

demo.util.Controller
  .extend("CustomersDialogFragment", new demo.view.fragments.SearchCustomersDialog())
  .extend("ProductsDialogFragment", new demo.view.fragments.SearchProductsDialog())
  .extend("demo.view.fragments.EventForm",
  {
    visibleFields: {
      "New Products / Innovation": ["CUSTOMER_ID", "OLD_MATERIAL", "NEW_MATERIAL", "OLD_UPC", "NEW_UPC", "VOLUME_PCT", "START_DATE", "PIPE_WOS", "PIPE_SHIP_WKS", "COMMENTS"],
      "In & Out Products": ["CUSTOMER_ID", "OLD_MATERIAL", "NEW_MATERIAL", "OLD_UPC", "NEW_UPC", "VOLUME_PCT", "START_DATE", "END_DATE", "PIPE_WOS", "PIPE_SHIP_WKS", "COMMENTS"],
      "Delistings & Deletions": ["CUSTOMER_ID", "OLD_MATERIAL", "OLD_UPC", "START_DATE", "COMMENTS"],
      "Distribution Changes": ["CUSTOMER_ID", "OLD_MATERIAL", "OLD_UPC", "VOLUME_PCT", "START_DATE", "COMMENTS"],
      "Future Product Code Linking": ["CUSTOMER_ID", "OLD_MATERIAL", "NEW_MATERIAL", "OLD_UPC", "NEW_UPC", "COMMENTS"],
      "Past Product Code Linking": ["CUSTOMER_ID", "OLD_MATERIAL", "NEW_MATERIAL", "OLD_UPC", "NEW_UPC", "START_DATE", "END_DATE", "PIPE_WOS", "PIPE_SHIP_WKS", "COMMENTS"],
      "Filtering Non Active History": ["CUSTOMER_ID", "OLD_MATERIAL", "OLD_UPC", "COMMENTS"]
    },

    triggerEventTypeChangeAfterLoad: function (oView) {
      // trigger onEventTypeChange() after form loads
      oView.byId("idAddEventForm").addEventDelegate({
        onAfterRendering: function () {
          this.onEventTypeChange();
        }
      }, this);
    },

    /**
     * Need to show/hide fields based on chosen EventType dropdown
     *
     * 1. try and get selected item (this only works when user manually changes dropdown)
     * 2. read value from newEvent model (this only works when clicking on detail/initial load)
     * 3. read first value from OData service (this only works when New Event button is clicked)
     */
    onEventTypeChange: function (evt) {
      var selectCtrl = this.getView().byId("selectEventType");
      var eventTypeName = "";
      var self = this;
      var newEventModel = this.getView().getModel("newEvent").getData();
      /* 1 */
      if (selectCtrl.getSelectedItem()) {
        eventTypeName = selectCtrl.getSelectedItem()
          .getBindingContext().getProperty("DESCRIPTION");
        self.filterFields(eventTypeName);
      } /* 2 */ else if (newEventModel && newEventModel.EVENT_ID && newEventModel.EVENT_TYPE_ID) {
        this.getView().getModel().read("/EventTypes(" + newEventModel.EVENT_TYPE_ID + ")", {
          success: jQuery.proxy(function (oData) {
            eventTypeName = oData.DESCRIPTION;
            if (!eventTypeName) {
              return;
            }
            self.filterFields(eventTypeName);
          }, this),
          error: jQuery.proxy(function () {
            // ???
          }, this)
        });
      } /* 3 */ else {
        // grab first item from odata
        this.getView().getModel().read("/EventTypes", {
          urlParameters: {
            "$top": 1,
            "$orderby": "EVENT_TYPE_ID asc",
            "$select": "DESCRIPTION"
          },
          success: jQuery.proxy(function (oData) {
            eventTypeName = oData.results[0].DESCRIPTION;
            if (!eventTypeName) {
              return;
            }
            self.filterFields(eventTypeName);
          }, this),
          error: jQuery.proxy(function () {
            // ???
          }, this)
        });
      }
    },

    filterFields: function (eventTypeName) {
      var oView = this.getView();
      var fields = this.visibleFields[eventTypeName];
      var form = oView.byId("idAddEventForm");
      var ctrl = {};

      // hide fields first
      $.each(form.getContent(), function (key, value) {
        if (value.hasStyleClass && value.hasStyleClass("cagHideable"))
          value.setVisible(false);
      });

      // display fields from this.visibleFields map
      $.each(fields, function (key, value) {
        ctrl = oView.byId('label' + value);
        if (ctrl) ctrl.setVisible(true);
        ctrl = oView.byId('input' + value);
        if (ctrl) ctrl.setVisible(true);
        ctrl = oView.byId('description' + value);
        if (ctrl) ctrl.setVisible(true);
      });

      // force UI5 to render changes
      sap.ui.getCore().applyChanges();
    },

    onSave: function () {

      // i think it's better for the main views
      // to implement their own onSave() function
      // so that they can handle it their own way

    },

    onCancel: function () {
      // override this method in your implementation
    },

    /**
     * Convert a string Date using moment.js into proper
     * date format expected by OData endpoint
     * http://momentjs.com/docs/#/parsing/asp-net-json-date/
     * sDate : string
     */
    buildExpectedODataDateString: function (sDate) {
      if (!sDate) return null;
      return moment(sDate).toISOString(); // ISO8601 string
    },

    createNewEventModel: function () {
      this.getView().setModel(new sap.ui.model.json.JSONModel(), "newEvent");
      this.getView().getModel("newEvent").setData({
        EVENT_ID: 0,
        EVENT_TYPE_ID: 0,
        STATUS_ID: 0,
        EVENT_NAME: "",
        CUSTOMER_ID: "",
        OLD_MATERIAL: "",
        OLD_UPC: "",
        NEW_MATERIAL: "",
        NEW_UPC: "",
        START_DATE: null,
        END_DATE: null
      });
    },

    validate_EventForm: function (showRequiredError) {
      var ctrl = {};
      var oView = this.getView();

      this.setValidationState(oView.byId("inputEVENT_NAME"), showRequiredError, false);

      ctrl = oView.byId("inputCUSTOMER_ID");
      ctrl.fireSuggest({
        suggestValue: ctrl.getValue()
      });
      this.setValidationState(ctrl, showRequiredError, true);
      ctrl = oView.byId("inputOLD_MATERIAL");
      ctrl.fireSuggest({
        suggestValue: ctrl.getValue()
      });
      this.setValidationState(ctrl, showRequiredError, true);
      ctrl = oView.byId("inputNEW_MATERIAL");
      ctrl.fireSuggest({
        suggestValue: ctrl.getValue()
      });
    },

    setValidationState: function (ctrl, required, showSuccess) {
      if (!ctrl.getValue() && required)
        ctrl.setValueState(sap.ui.core.ValueState.Error);
      else if (ctrl.getValue() && showSuccess)
        ctrl.setValueState(sap.ui.core.ValueState.Success);
      else
        ctrl.setValueState(sap.ui.core.ValueState.None);
    },

    validate_Populated: function (evt) {
      var textControl = evt.getSource();
      if (textControl.getValue() === "") {
        textControl.setValueState(sap.ui.core.ValueState.Error);
      } else {
        textControl.setValueState(sap.ui.core.ValueState.None);
      }
    },

    customerSuggest: function (evt) {
      var self = this;
      var ctrl = evt.getSource();
      var descriptionControlId = "description" + ctrl.getId().split('input')[1];
      var descriptionValue = this.getView().byId(descriptionControlId);
      descriptionValue.setValue("-");
      ctrl.setValueState(sap.ui.core.ValueState.None);
      var searchTerm = evt.getParameter("suggestValue");
      if (!searchTerm) return;
      var idFilter = new sap.ui.model.Filter({
        path: "CUSTOMER_LVL_ID1",
        operator: sap.ui.model.FilterOperator.Contains,
        value1: searchTerm
      });
      this.getView().getModel().read("/Customers", {
        urlParameters: {
          "$select": "CUSTOMER_LVL_ID1, CUSTOMER_LVL_DESC1"
        },
        filters: [idFilter],
        success: jQuery.proxy(function (oData) {
          if (oData.results.length == 1) {
            var match = oData.results[0];
            ctrl.setValue(match.CUSTOMER_LVL_ID1);
            ctrl.setValueState(sap.ui.core.ValueState.Success);
            descriptionValue.setValue(match.CUSTOMER_LVL_DESC1);
          }
        }, this),
        error: jQuery.proxy(function () {
          jQuery.sap.log.error("Failed to read from /Customers service");
        }, this)
      });
    },

    materialSuggest: function (evt) {
      var self = this;
      var ctrl = evt.getSource();
      var descriptionControlId = "description" + ctrl.getId().split('input')[1];
      var isNew = descriptionControlId.indexOf('NEW') > 0; // could be used to determine UPC later
      var descriptionValue = this.getView().byId(descriptionControlId);
      descriptionValue.setValue("-");
      ctrl.setValueState(sap.ui.core.ValueState.None);
      var searchTerm = evt.getParameter("suggestValue");
      if (!searchTerm) return;
      var idFilter = new sap.ui.model.Filter({
        path: "PRODUCT_ID",
        operator: sap.ui.model.FilterOperator.Contains,
        value1: searchTerm
      });
      this.getView().getModel().read("/Products", {
        urlParameters: {
          "$select": "PRODUCT_ID, PRODUCT_DESC, PRODUCT_ATTRIB1"
        },
        filters: [idFilter],
        success: jQuery.proxy(function (oData) {
          if (oData.results.length == 1) {
            var match = oData.results[0];
            ctrl.setValue(match.PRODUCT_ID);
            ctrl.setValueState(sap.ui.core.ValueState.Success);
            descriptionValue.setValue(match.PRODUCT_DESC);
          }
        }, this),
        error: jQuery.proxy(function () {
          jQuery.sap.log.error("Failed to read from /Products service");
        }, this)
      });
    }

  });