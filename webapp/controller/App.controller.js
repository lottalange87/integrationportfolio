sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Panel",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/Label",
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/ObjectStatus",
    "sap/m/MessageToast",
    "sap/m/Title"
], function (
    Controller, Panel, HBox, VBox, Text, Label, Button,
    Dialog, Input, TextArea, Select, Item, ObjectStatus,
    MessageToast, Title
) {
    "use strict";

    // ── Layer → ObjectStatus state mapping ──────────────────────────────────
    var mLayerState = {
        "Strategy":    "Warning",
        "Integration": "Information",
        "Operations":  "Success",
        "Governance":  "Error",
        "Security":    "None"
    };

    // ── Sample data ──────────────────────────────────────────────────────────
    var aSampleOfferings = [
        {
            id: "1",
            title: "Integration Strategy & Assessment",
            description: "Evaluate current integration landscape, define target architecture and roadmap. Align integration goals with business strategy.",
            layer: "Strategy",
            outcomes: "Integration roadmap, Architecture blueprint, Gap analysis"
        },
        {
            id: "2",
            title: "API Design & Development",
            description: "Design RESTful and event-driven APIs using SAP Integration Suite or BTP services. Ensure reusability and governance.",
            layer: "Integration",
            outcomes: "Published APIs, API documentation, Test coverage report"
        },
        {
            id: "3",
            title: "Integration Platform Setup",
            description: "Configure and deploy SAP BTP Integration Suite. Set up CI/CD pipelines for integration artifacts and environments.",
            layer: "Integration",
            outcomes: "Running platform, CI/CD pipeline, Deployment guidelines"
        },
        {
            id: "4",
            title: "Monitoring & Operations",
            description: "Implement end-to-end monitoring, alerting and incident management for integration flows. Provide operational runbooks.",
            layer: "Operations",
            outcomes: "Monitoring dashboard, Alert rules, Operations runbook"
        }
    ];

    return Controller.extend("integrationportfolio.controller.App", {

        // ────────────────────────────────────────────────────────────────────
        onInit: function () {
            this._offerings = JSON.parse(JSON.stringify(aSampleOfferings));
            this._nextId    = 5;
        },

        onAfterRendering: function () {
            this._renderCards();
        },

        // ────────────────────────────────────────────────────────────────────
        // RENDER CARDS
        // Destroys and re-builds the entire HBox content each time.
        // ────────────────────────────────────────────────────────────────────
        _renderCards: function () {
            var oFlow = this.byId("offeringsFlow");
            oFlow.destroyItems();

            var aOfferings = this._offerings;
            var that       = this;

            aOfferings.forEach(function (oOffering, iIdx) {

                // ── Card ──────────────────────────────────────────────────
                var oCard = that._buildCard(oOffering, iIdx, aOfferings.length);

                // ── Arrow (except after last card) ────────────────────────
                if (iIdx < aOfferings.length - 1) {
                    var oArrow = new VBox({
                        justifyContent: "Center",
                        alignItems:     "Center",
                        width:          "44px",
                        items: [
                            new Text({ text: "→" }).addStyleClass("offeringArrow")
                        ]
                    }).addStyleClass("offeringArrowWrapper");

                    // Wrap card + arrow in an HBox
                    var oGroup = new HBox({
                        alignItems: "Center",
                        items: [oCard, oArrow]
                    });
                    oFlow.addItem(oGroup);
                } else {
                    // Last card — no arrow
                    oFlow.addItem(oCard);
                }
            });
        },

        // ────────────────────────────────────────────────────────────────────
        // BUILD A SINGLE CARD
        // ────────────────────────────────────────────────────────────────────
        _buildCard: function (oOffering, iIdx, iTotal) {
            var that = this;

            var oStatus = new ObjectStatus({
                text:  oOffering.layer,
                state: mLayerState[oOffering.layer] || "None"
            }).addStyleClass("sapUiTinyMarginBottom");

            var oDesc = new Text({
                text:     oOffering.description,
                maxLines: 4
            }).addStyleClass("sapUiTinyMarginBottom");

            var oOutcomesLabel = new Label({ text: "Outcomes:", design: "Bold" });
            var oOutcomesText  = new Text({ text: oOffering.outcomes || "—", maxLines: 3 });

            var oMoveLeft = new Button({
                icon:    "sap-icon://navigation-left-arrow",
                type:    "Transparent",
                tooltip: "Move left",
                enabled: iIdx > 0,
                press:   function () { that._move(iIdx, -1); }
            });

            var oMoveRight = new Button({
                icon:    "sap-icon://navigation-right-arrow",
                type:    "Transparent",
                tooltip: "Move right",
                enabled: iIdx < iTotal - 1,
                press:   function () { that._move(iIdx, +1); }
            });

            var oDelete = new Button({
                icon:    "sap-icon://delete",
                type:    "Transparent",
                tooltip: "Remove offering",
                press:   function () { that._delete(iIdx); }
            });

            var oActionRow = new HBox({
                justifyContent: "SpaceBetween",
                alignItems:     "Center",
                items: [
                    new HBox({ items: [oMoveLeft, oMoveRight] }),
                    oDelete
                ]
            }).addStyleClass("sapUiTinyMarginTop");

            var oBody = new VBox({
                items: [oStatus, oDesc, oOutcomesLabel, oOutcomesText, oActionRow]
            }).addStyleClass("sapUiSmallMarginBeginEnd sapUiTinyMarginTopBottom");

            var oPanel = new Panel({
                headerText: oOffering.title,
                expandable: false,
                width:      "280px",
                content:    [oBody]
            }).addStyleClass("offeringCard sapUiSmallMargin");

            return oPanel;
        },

        // ────────────────────────────────────────────────────────────────────
        // REORDER
        // ────────────────────────────────────────────────────────────────────
        _move: function (iIdx, iDelta) {
            var iTarget = iIdx + iDelta;
            if (iTarget < 0 || iTarget >= this._offerings.length) return;
            var tmp                    = this._offerings[iIdx];
            this._offerings[iIdx]      = this._offerings[iTarget];
            this._offerings[iTarget]   = tmp;
            this._renderCards();
        },

        _delete: function (iIdx) {
            this._offerings.splice(iIdx, 1);
            this._renderCards();
            MessageToast.show("Offering removed.");
        },

        // ────────────────────────────────────────────────────────────────────
        // ADD OFFERING DIALOG
        // ────────────────────────────────────────────────────────────────────
        onAddOffering: function () {
            if (!this._oDialog) {
                this._oTitleInput    = new Input({ placeholder: "e.g. API Governance", width: "100%" });
                this._oLayerSelect   = new Select({
                    width: "100%",
                    items: [
                        new Item({ key: "Strategy",    text: "Strategy" }),
                        new Item({ key: "Integration", text: "Integration" }),
                        new Item({ key: "Operations",  text: "Operations" }),
                        new Item({ key: "Governance",  text: "Governance" }),
                        new Item({ key: "Security",    text: "Security" })
                    ]
                });
                this._oDescInput     = new TextArea({ placeholder: "Short description of this service offering...", rows: 3, width: "100%" });
                this._oOutcomesInput = new TextArea({ placeholder: "Key outcomes, deliverables (comma-separated or free text)...", rows: 2, width: "100%" });

                this._oDialog = new Dialog({
                    title:        "Add Service Offering",
                    contentWidth: "500px",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Title", required: true }),
                                this._oTitleInput,
                                new Label({ text: "Portfolio Layer", required: true }).addStyleClass("sapUiTinyMarginTop"),
                                this._oLayerSelect,
                                new Label({ text: "Description" }).addStyleClass("sapUiTinyMarginTop"),
                                this._oDescInput,
                                new Label({ text: "Outcomes / Deliverables" }).addStyleClass("sapUiTinyMarginTop"),
                                this._oOutcomesInput
                            ]
                        }).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginTopBottom")
                    ],
                    beginButton: new Button({
                        text:  "Add",
                        type:  "Emphasized",
                        press: this._onDialogConfirm.bind(this)
                    }),
                    endButton: new Button({
                        text:  "Cancel",
                        press: function () { this._oDialog.close(); }.bind(this)
                    }),
                    afterClose: this._resetDialog.bind(this)
                });

                this.getView().addDependent(this._oDialog);
            }

            this._oDialog.open();
        },

        _onDialogConfirm: function () {
            var sTitle = this._oTitleInput.getValue().trim();
            if (!sTitle) {
                MessageToast.show("Please enter a title.");
                return;
            }

            this._offerings.push({
                id:          String(this._nextId++),
                title:       sTitle,
                layer:       this._oLayerSelect.getSelectedKey(),
                description: this._oDescInput.getValue().trim(),
                outcomes:    this._oOutcomesInput.getValue().trim()
            });

            this._oDialog.close();
            this._renderCards();
            MessageToast.show("Service Offering added.");
        },

        _resetDialog: function () {
            if (this._oTitleInput)    this._oTitleInput.setValue("");
            if (this._oDescInput)     this._oDescInput.setValue("");
            if (this._oOutcomesInput) this._oOutcomesInput.setValue("");
            if (this._oLayerSelect)   this._oLayerSelect.setSelectedItem(this._oLayerSelect.getItems()[0]);
        }

    });
});
