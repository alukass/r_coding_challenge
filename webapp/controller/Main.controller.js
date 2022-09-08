sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"my/app/model/formatter"
], function (Controller, Formatter) {
	"use strict";

	return Controller.extend("my.app.controller.Main", {

		/**
		 * Notes:
		 * 		1. You will find both ECMAScript 2015 and pre ES6 syntax in this app due to SAPUI5 not officially supporting ES6 yet and having many legacy feature/quirks with it,
		 * 			most notably arrow function notation. There are ways around it of course, but on this rather basic template it was not worth the effort to support ES6 fully
		 * 		2. I did not touch basic template project files such as Component.js, index.html, metadata.xml which is why variables are declared using the 'var' keyword
		 * 		3. I tried to leave as many comments as I could to make reading this framework/library easier, you will find them in JS, XML, CSS files. 
		 * 		4. Best of luck and thanks for looking into this!
		 */

		// attach utility formatter module to controller, it will be accessible in XML through syntax '.formatter'
		formatter: Formatter,

		/**
		 * SAPUI5 lifecycle method triggered when DOM has finished loading
		 * In case of SAPUI5 there are many such methods, for example onBeforeRendering, onAfterRendering, onExit, etc. which listen to various DOM updates and what not
		 * But I chose onInit because it triggers only once for each controller just after it is created and for model/data creation it is sufficient to be run only once
		 */
		onInit: function () {
			this.initializeModels();
		},

		/**
		 * Creates and loads initial data models
		 * These models are defined in project root settings in manifest.json and because of that can be accessed anytime throughout all App
		 * In a more serious environment models should be localized per view/per controller/etc. and created/handled separately
		 */
		initializeModels: function () {
			// create initial values for model that tracks user interaction
			const oUserModel = this.getOwnerComponent().getModel('user');
			oUserModel.setData({
				form: {
					current_page: 0,
					page_count: 0,
				},
			})

			// load initial 'API' values into survey model (level_one)
			this.loadLocalDataModel('survey');
		},

		/**
		 * Load model from local data source
		 * In ideal world obviously this method should be re-written and/or scanned for security vulnerabilities
		 * @param {String} sName name of model
		 */
		loadLocalDataModel: function(sName) {
			const oModel = this.getOwnerComponent().getModel(sName);

			// setting models to views or controls in our case is not necessary because we have already defined models in manifest.json and therefore they are accessible throughout the App, 
			// however in real world I would probably use something similar to this code line instead to localize access of data to specific parts of application
			this.getView().setModel(oModel, sName.toUpperCase());

			// load data asynchronously and attach logic that triggers when data has finished loading
			oModel.loadData('data/survey.json');
			oModel.attachRequestCompleted(this._onDataLoaded.bind(this));
		},

		/**
		 * Read survey data and update user interaction model
		 * This function would be redundant if we switched model load order but I just wanted to showcase how asynchronous logic can be invoked if needed
		 * @param {Object} oEvent sap event object; contains Promise
		 */
		_onDataLoaded: function(/*oEvent*/){
			const iPageCount = this.getView().getModel('survey').getProperty('/data/pages').length;
			this.getView().getModel('user').setProperty('/form/page_count', iPageCount);
		},

		/**
		 * 'Back' button press event
		 * @param {Object} oEvent sap event object
		 */
		onPressButtonNavigateBack: function(/*oEvent*/) {
			const oUserModel = this.getView().getModel('user');
			oUserModel.setProperty('/form/current_page', this.getCurrentPage() - 1);
		},

		/**
		 * 'Next' button press event
		 * @param {Object} oEvent sap event object
		 */
		onPressButtonNavigateNext: function (/*oEvent*/) {
			const oUserModel = this.getView().getModel('user');
			oUserModel.setProperty('/form/current_page', this.getCurrentPage() + 1);
		},

		/**
		 * Finds current page in model
		 * @returns {Number}
		 */
		getCurrentPage: function() {
			return this.getView().getModel('user').getProperty('/form/current_page');
		},

		/**
		 * Checks if passed page is currently visible
		 * I did not put this method in Formatter module because it also reads other data than what was passed (model in this case), 
		 * which implies that the method belongs within application level - and not utility layer
		 * @param {Object} oPage page data object
		 * @param {Number} iCurrentPage currently active page
		 * @returns {Boolean}
		 */
		isCurrentPage: function (oPage, iCurrentPage) {
			const aPages = this.getView().getModel('survey').getProperty('/data/pages');
			return aPages.indexOf(oPage) === iCurrentPage;
		},
	});

});