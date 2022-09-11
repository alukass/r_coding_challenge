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
				table: {
					expanded_level: 0,
				}
			})

			// load initial 'API' values into survey model (level_one)
			this.loadLocalDataModel('survey');
			// load initial 'API' values into table model (level_two)
			this.loadLocalDataModel('quotas');
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
			// initially I wanted to use si
			oModel.loadData(`data/${sName}.json`);
			if (sName === 'survey'){
				oModel.attachRequestCompleted(this._onDataLoadedSurvey.bind(this));
			} else if (sName === 'quotas') {
				oModel.attachRequestCompleted(this._onDataLoadedQuotas.bind(this));
			}
		},

		/**
		 * Read survey data and update user interaction model
		 * This function would be redundant if we switched model load order but I just wanted to showcase how asynchronous logic can be invoked if needed
		 * @param {Object} oEvent sap event object; contains Promise
		 */
		_onDataLoadedSurvey: function(/*oEvent*/){
			const iPageCount = this.getView().getModel('survey').getProperty('/data/pages').length;
			this.getView().getModel('user').setProperty('/form/page_count', iPageCount);
		},

		/**
		 * Read quotas data and process it by adding addiitonal properties for XML binding purposes
		 * @param {Object} oEvent sap event object; contains Promise
		 */
		_onDataLoadedQuotas: function(/*oEvent*/){
			const aData = this.getView().getModel('quotas').getProperty('/data');

			this._recursiveProcessDimensions(aData, 0);
		},

		/**
		 * Recursively travel the data tree and add 'level' property that indicate how deep is each dimension nested
		 * An impovement could be to not modify loaded data but deep-copy it and work with the cloned version instead (as to not pollute loaded data and/or accidentally damage it)
		 * @param {Array} aDimensions 
		 * @param {Number} iLevel 
		 */
		_recursiveProcessDimensions: function(aDimensions, iLevel){
			for (const oDimension of aDimensions) {
				oDimension.level = iLevel;
				if (oDimension.hasOwnProperty('dimensions')){
					this._recursiveProcessDimensions(oDimension.dimensions, iLevel + 1);
				}
			}
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

		/**
		 * LEVEL 2
		 */

		/**
		 * Triggered by clicking on table column header
		 * Collapses or expands table as per requirement in coding challenge
		 * @param {Object} oEvent sap event object
		 */
		onPressGroupColumn: function(oEvent){
			const oUserModel = this.getView().getModel('user');
			const oTable = oEvent.getSource();
			const iColumnIndex = oEvent.getParameter('column').getIndex();
			const iColumnIndexPrevious = oUserModel.getProperty('/table/expanded_level');
			let iColSubDimension = 1;
			let iColSubPrevious = 0;
	
			const bExpand = iColumnIndex > iColumnIndexPrevious;
			if (!bExpand){
				iColSubDimension = 2;
				iColSubPrevious = 1;
			}

			oTable.collapseAll();

			oTable.expandToLevel(iColumnIndex - iColSubDimension);
			oUserModel.setProperty('/table/expanded_level', iColumnIndex - iColSubPrevious);
		},

		/**
		 * A really nasty function that I do not like and its result should be achieved by other means. Triggers every time the table rows change, i.e.
		 * 	scroll, expand, collapse, etc.
		 * 
		 * This was the last thing I implemented for the coding challenge so I just wanted to kind of brute force it by this point
		 * 
		 * I wanted to replicate the visually merged cells seen in example PNG layout (which is not achievable by standart SAPUI5 TreeTable control)
		 * 	and the cells all have borders around them by default. You can check that if you want by commenting out this function
		 * 
		 * Purpose is to work around SAPUI5 TreeTable limitation that does not allow 'merging' cells vertically by default and implement a hacky 'merge' that hides borders instead
		 * Reason why I think its bad:
		 * 	1. It accesses DOM from JS code which means it is inefficient and resource-intensive on the client browser which can hurt performance and/or memory
		 * 	2. It would scale badly on huge datasets or tables calculating heavy operations per each table cell
		 * 	3. Even on SAPUI5 a better solution exists which is to extend the TreeTable or Row control and customize it by adding additional properties and implementation
		 * 		for cell merging purposes, however that would take more time to figure out and write code properly which just wasn't worth the effort
		 * 	4. Without all that this function can be rewritten or refactored but I was too tired to think it through on late Sunday eve. My linter screams that this fuction exceeds Cognitive Compexity 
		 * 		set on my VS Code due to nested loops but yeah 
		 * 
		 * Overall if you ignore all the negatives and potential improvements this kind-of gets the job done
		 * 
		 * Some border-tops and border-bottoms overlap so on some cells they cumulatively look a little thicker and while it can probably be solved I just didn't bother unfortunately
		 * 
		 * @param {Object} oEvent sap event object
		 */
		mergeCells: function(oEvent){
			const oTable = oEvent.getSource();
			const aRows = oTable.getRows();

			for (const oRow of aRows) {
				const aCells = oRow.getCells();
				const oRowDom = oRow.getDomRef();

				const oBindingContext = oRow.getBindingContext('quotas');
				const sTitle = oBindingContext ? oBindingContext.getObject().title : '';

				// add CSS classes to row that indicate that these rows contain no data and a way to easily circumvent merging implementations done below
				if (!sTitle) {
					oRowDom.classList.add('noData')
				} else {
					oRowDom.classList.remove('noData')
				}

				let bMerge = true;
				for (let i = 0; i < aCells.length; i++){
					const oCell = aCells[i];
					const sText = oCell.getText();
					const oCellDom = oCell.getDomRef();

					// add CSS classes to cell element that indicate that its content can be either 'merged' or 'not merged'
					if (i !== 0) {
						if (bMerge){
							if (!sText) {
								oCellDom.parentElement.parentElement.classList.add('merge')
							} else {
								bMerge = false;
							}
						} else {
							if (!sText) {
								oCellDom.parentElement.parentElement.classList.add('noMerge')
							}
						}
					}

					// clear CSS classes (table re-uses cells after re-rendering so this solves inconsistency on data reload or scroll)
					if (bMerge) {
						oCellDom.parentElement.parentElement.classList.remove('noMerge')
					} else {
						oCellDom.parentElement.parentElement.classList.remove('merge');
					}

					if (!!sText) {
						// add CSS class that indicate that the cell has valid text content and must act as group parent for merged cells below it
						oCellDom.parentElement.parentElement.classList.add('hasText');
					} else {
						// clear CSS classes (table re-uses cells after re-rendering so this solves inconsistency on data reload or scroll)
						oCellDom.parentElement.parentElement.classList.remove('hasText');
					}
				}
			}
		},

	});
});