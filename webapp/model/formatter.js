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
		 * Converts value to boolean
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
		 * Checks if first passed number is smaller second passed number
		 * @param {Number} iOne 
		 * @param {Number} iTwo
		 * @returns {Boolean}
		 */
		isSmallerThan: (iOne, iTwo) => {
			return iOne < iTwo;
		},

		/**
		 * Compares if two values are equal
		 * @param {*} one 
		 * @param {*} two 
		 * @returns {Boolean}
		 */
		isEqual: (one, two) => {
			return one === two;
		},
	};
});