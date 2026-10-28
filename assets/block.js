/**
 * Cook Mode block for the block editor. Rendered on the server.
 */
( function ( blocks, element, blockEditor, components, ServerSideRender, i18n ) {
	'use strict';

	var el = element.createElement;
	var __ = i18n.__;

	blocks.registerBlockType( 'wakechef-cook-mode/toggle', {
		edit: function ( props ) {
			var attributes = props.attributes;
			return el(
				'div',
				blockEditor.useBlockProps(),
				el(
					blockEditor.InspectorControls,
					null,
					el(
						components.PanelBody,
						{ title: __( 'Text', 'wakechef-cook-mode' ) },
						el( components.TextControl, {
							label: __( 'Label', 'wakechef-cook-mode' ),
							help: __( 'Leave empty to use the text from the plugin settings.', 'wakechef-cook-mode' ),
							value: attributes.label,
							onChange: function ( value ) {
								props.setAttributes( { label: value } );
							},
						} ),
						el( components.TextControl, {
							label: __( 'Description', 'wakechef-cook-mode' ),
							value: attributes.description,
							onChange: function ( value ) {
								props.setAttributes( { description: value } );
							},
						} )
					)
				),
				el( ServerSideRender, { block: 'wakechef-cook-mode/toggle', attributes: attributes } )
			);
		},
		save: function () {
			return null;
		},
	} );
}( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components, window.wp.serverSideRender, window.wp.i18n ) );
