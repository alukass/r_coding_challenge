sap.ui.define([], function () {
	"use strict";

	return {
		// quick nasty HTML text formatter
		// for HTML tag support solution should be more thought out. SAPUI5 has sap.m.FormattedText control which kind-of supports HTML tags, 
		// but I could not find an easy solution to also allow text wrapping (single text lines within HTML tag do not get wrapped)
		/**
		 * Replaces HTML breakpoints with newlines
		 * @param {String} sText HTML paragraph text
		 * @returns {String}
		 */
		formatHtml: (sText) => {
			return sText ? sText.replaceAll('<br>', '\n') : '';
		},

		/**
		 * Checks if passed value is positive boolean
		 * @param {Boolean} bValue 
		 * @returns {Boolean}
		 */
		isBooleanTrue: (bValue) => typeof bValue === 'boolean' && bValue,

		/**
		 * Returns first key of passed object
		 * @param {Object} oObj
		 * @returns {String}
		 */
		getFirstObjectKey: (oObj) => {
			return oObj && typeof oObj === 'object' ? Object.keys(oObj)[0] : '';
		},

		/**
		 * Returns first truthy passed argument
		 * @param {String} sOne first argument
		 * @param {String} sTwo second argument
		 * @returns {String}
		 */
		getFirstTruthyArgumentValue: (sOne, sTwo) => {
			return sOne || sTwo || '';
		},

		/**
		 * Custom text formatter for 'Next' button
		 * @param {String} sNext 
		 * @param {String} sComplete 
		 * @param {Number} iCurrentPage 
		 * @param {Number} iPageCount 
		 * @returns {String}
		 */
		getNextButtonText: (sNext, sComplete, iCurrentPage, iPageCount) => {
			return iCurrentPage === iPageCount - 1 ? sComplete : sNext;
		},

		/**
		 * Converts value to NOT boolean and to string
		 * @param {*} value 
		 * @returns {Boolean}
		 */
		notToString: (value) => !value ? 'true' : 'false',

		/**
		 * Converts value to DOUBLE NOT boolean
		 * @param {*} value 
		 * @returns {Boolean}
		 */
		doubleNot: (value) => !!value,

		/**
		 * Checks if passed number is larger than 0
		 * @param {Number} iNum 
		 * @returns {Boolean}
		 */
		isBiggerThanZero: (iNum) => {
			return iNum > 0;
		},

		/**
		 * Checks if passed number is larger than or equal to second argument and converts to string
		 * @param {Number} iCurrentLevel 
		 * @param {String} sTargetLevel 
		 * @returns {String}
		 */
		isBiggerOrEqualToString: (iCurrentLevel, sTargetLevel) => iCurrentLevel >= parseInt(sTargetLevel) ? 'true' : 'false',

		/**
		 * Checks if first passed number is smaller second passed number
		 * @param {Number} iOne 
		 * @param {Number} iTwo
		 * @returns {Boolean}
		 */
		isSmallerThan: (iOne, iTwo) => iOne < iTwo,
		isSmallerThanToString: (iOne, iTwo) => iOne < parseInt(iTwo) ? 'true' : 'false',

		/**
		 * Compares if two values are equal
		 * @param {*} one 
		 * @param {*} two 
		 * @returns {Boolean}
		 */
		isEqual: (one, two) => one === two,

		/**
		 * Populates cell with text based on current data object level
		 * 	if dimension levels match, use passed text value
		 * 	if dimension level indicates that cell is collapsed, use fallback translation text
		 * 	else use empty string ('merged' cell) 
		 * @param {String} sText proposed text value
		 * @param {Number} iCurrentLevel dimension level of current data object
		 * @param {String} sTargetLevel target dimension level of desired place
		 * @param {String} sTranslation i18n fallback text
		 * @returns {String}
		 */
		getCellTextIfVisible: (sText, iCurrentLevel, sTargetLevel, sTranslation) => {
			let sCellText = '';
			const iTargetLevel = parseInt(sTargetLevel);

			if (iCurrentLevel === iTargetLevel) {
				sCellText = sText;
			} else if (iCurrentLevel < iTargetLevel) {
				sCellText = sTranslation;
			}

			return sCellText
		},

		/**
		 * Calculates average values of passed object array children
		 * Could probably be consolidated with 'sumRecursively' function with a little more thought
		 * @param {Object} oDimension model data object
		 * @param {Number} iResponseRate value if it already exists
		 * @returns {Number} max 2 decimals after comma
		 */
		averageRecursively: (oDimension, iResponseRate) => {
			let fAvg;

			// merges array child elements into single array
			const fnFlatten = (aDims) => aDims.flatMap(oDim => oDim.dimensions);

			if (typeof iResponseRate === 'number') {
				// we are on last dimension, no need to calculate anything
				fAvg = iResponseRate;
			} else if (oDimension && oDimension.hasOwnProperty('dimensions')) {
				// sum 'possibleInvites' of array children recursively by generating single object-array and calling 'reduce' on its properties
				// calculate average by dividing sum of 
				let aDimensions = oDimension.dimensions;
				let iSum;
				while (aDimensions[0] && aDimensions[0].hasOwnProperty('dimensions')) {
					aDimensions = fnFlatten(aDimensions);
				}
				iSum = aDimensions.reduce((iSumCurrent, oDim) => iSumCurrent + oDim.responseRate, 0);
				fAvg = iSum / aDimensions.length;
				// round value to double decmals; Number.EPSILON allows to round edge-case values like 1.005
				fAvg = Math.round((fAvg + Number.EPSILON) * 100) / 100;
			}

			return fAvg;
		},

		/**
		 * Calculates sum values of passed object array children
		 * Could probably be consolidated with 'averageRecursively' function with a little more thought
		 * @param {Object} oDimension model data object
		 * @param {Number} iInvites value if it already exists
		 * @returns {Number}
		 */
		sumRecursively: (oDimension, iInvites) => {
			let iSum;

			// merges array child elements into single array
			const fnFlatten = (aDims) => aDims.flatMap(oDim => oDim.dimensions);

			if (typeof iInvites === 'number') {
				// we are on last dimension, no need to calculate anything
				iSum = iInvites;
			} else if (oDimension && oDimension.hasOwnProperty('dimensions')) {
				// sum 'possibleInvites' of array children recursively by generating single object-array and calling 'reduce' on its properties
				let aDimensions = oDimension.dimensions;
				while (aDimensions[0] && aDimensions[0].hasOwnProperty('dimensions')) {
					aDimensions = fnFlatten(aDimensions);
				}
				iSum = aDimensions.reduce((iSumCurrent, oDim) => iSumCurrent + oDim.possibleInvites, 0);
			}

			return iSum;
		},

	};
});