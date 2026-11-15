/**
 * WakeChef Cook Mode: keeps the screen awake while any Cook Mode toggle is on,
 * and opens the recipe as a full-screen, step-by-step Cook view.
 * All toggles on a page share one wake lock and stay in sync.
 */
( function () {
	'use strict';

	var strings = window.wakechefCookMode || {};
	var text = strings.view || {};
	var wakeLock = null;
	var wanted = false;
	var supported = 'wakeLock' in navigator;

	// Tells add-ons what the reader does: listen with document.addEventListener( 'wakechef:cookview:open', ... ).
	function emit( name, detail ) {
		if ( 'function' === typeof window.CustomEvent ) {
			document.dispatchEvent( new CustomEvent( 'wakechef:' + name, { detail: detail } ) );
		}
	}

	/* ------------------------------------------------------------------
	 * Screen wake lock, shared by the toggles and the Cook view.
	 * ------------------------------------------------------------------ */

	function toggles() {
		return Array.prototype.slice.call( document.querySelectorAll( '.wakechef-cook-mode' ) );
	}

	function render( message, state ) {
		toggles().forEach( function ( toggle ) {
			toggle.querySelector( '.wakechef-cook-mode__input' ).checked = wanted;
			toggle.classList.toggle( 'is-active', 'active' === state );
			toggle.classList.toggle( 'is-error', 'error' === state );
			toggle.querySelector( '.wakechef-cook-mode__status' ).textContent = message || '';
		} );
		document.documentElement.classList.toggle( 'wakechef-awake', 'active' === state );
	}

	function acquire() {
		return navigator.wakeLock.request( 'screen' ).then( function ( lock ) {
			wakeLock = lock;
			render( strings.active, 'active' );
			// The browser releases the lock when the page is hidden. Re-acquire on return.
			lock.addEventListener( 'release', function () {
				wakeLock = null;
				if ( wanted ) {
					render( strings.paused, 'paused' );
				}
			} );
		} );
	}

	function enable() {
		if ( ! supported ) {
			return;
		}
		wanted = true;
		render( '', '' );
		acquire().catch( function () {
			wanted = false;
			render( strings.failed, 'error' );
		} );
	}

	function disable() {
		wanted = false;
		if ( wakeLock ) {
			wakeLock.release();
			wakeLock = null;
		}
		render( '', '' );
	}

	/* ------------------------------------------------------------------
	 * Recipe data: the schema.org Recipe that recipe card plugins print as JSON-LD.
	 * ------------------------------------------------------------------ */

	function isType( node, type ) {
		var types = node && node[ '@type' ];
		return Array.isArray( types ) ? types.indexOf( type ) !== -1 : types === type;
	}

	// Finds Recipe nodes anywhere in a JSON-LD document: top level, arrays, @graph, or nested.
	function collectRecipes( node, found, depth ) {
		if ( ! node || 'object' !== typeof node || depth > 6 ) {
			return;
		}
		if ( Array.isArray( node ) ) {
			node.forEach( function ( child ) {
				collectRecipes( child, found, depth + 1 );
			} );
			return;
		}
		if ( isType( node, 'Recipe' ) ) {
			found.push( node );
			return;
		}
		Object.keys( node ).forEach( function ( key ) {
			if ( node[ key ] && 'object' === typeof node[ key ] ) {
				collectRecipes( node[ key ], found, depth + 1 );
			}
		} );
	}

	// Plain text from a value that may hold HTML or entities such as &#8217;. DOMParser never runs scripts.
	function plain( value ) {
		if ( 'string' !== typeof value && 'number' !== typeof value ) {
			return '';
		}
		var doc = new DOMParser().parseFromString( '<body>' + String( value ) + '</body>', 'text/html' );
		return ( doc.body.textContent || '' ).replace( /\s+/g, ' ' ).trim();
	}

	function stepText( step ) {
		if ( 'string' === typeof step ) {
			return plain( step );
		}
		var body = plain( step.text );
		// Some cards put the step in itemListElement as HowToDirection and HowToTip items.
		if ( ! body && Array.isArray( step.itemListElement ) ) {
			body = step.itemListElement.map( function ( item ) {
				return plain( item.text || item.name || item );
			} ).filter( Boolean ).join( ' ' );
		}
		return body || plain( step.name );
	}

	// Flattens recipeInstructions into [{ section, text }], whatever shape the card plugin used.
	function flattenSteps( value, section, out ) {
		if ( ! value ) {
			return out;
		}
		if ( 'string' === typeof value ) {
			value.split( /\r?\n/ ).forEach( function ( line ) {
				var t = plain( line );
				if ( t ) {
					out.push( { section: section, text: t } );
				}
			} );
			return out;
		}
		if ( Array.isArray( value ) ) {
			value.forEach( function ( item ) {
				flattenSteps( item, section, out );
			} );
			return out;
		}
		if ( isType( value, 'HowToSection' ) || isType( value, 'ItemList' ) ) {
			flattenSteps( value.itemListElement, plain( value.name ) || section, out );
			return out;
		}
		var t = stepText( value );
		if ( t ) {
			out.push( { section: section, text: t, source: value } );
		}
		return out;
	}

	function readYield( value ) {
		var list = Array.isArray( value ) ? value : [ value ];
		var best = '';
		list.forEach( function ( item ) {
			var t = plain( item );
			// Prefer "12 cookies" over a bare "12".
			if ( t.length > best.length ) {
				best = t;
			}
		} );
		return best;
	}

	function findRecipe() {
		var recipes = [];
		Array.prototype.forEach.call( document.querySelectorAll( 'script[type="application/ld+json"]' ), function ( script ) {
			try {
				collectRecipes( JSON.parse( script.textContent ), recipes, 0 );
			} catch ( e ) {
				// Ignore invalid JSON-LD from other plugins.
			}
		} );
		for ( var i = 0; i < recipes.length; i++ ) {
			var steps = flattenSteps( recipes[ i ].recipeInstructions, '', [] );
			if ( steps.length ) {
				var ingredients = ( Array.isArray( recipes[ i ].recipeIngredient ) ? recipes[ i ].recipeIngredient : [ recipes[ i ].recipeIngredient ] )
					.map( plain )
					.filter( Boolean );
				return {
					name: plain( recipes[ i ].name ),
					yield: readYield( recipes[ i ].recipeYield ),
					ingredients: ingredients,
					steps: steps,
					source: recipes[ i ],
				};
			}
		}
		return null;
	}

	/* ------------------------------------------------------------------
	 * Cook view
	 * ------------------------------------------------------------------ */

	var recipe = null;
	var view = null;
	var state = { step: 0, checked: [], size: 1, tab: 'ingredients' };
	var opener = null;
	var wasWanted = false;
	var storeKey = 'wakechef-cook-view:' + location.pathname;

	function load() {
		try {
			var saved = JSON.parse( window.sessionStorage.getItem( storeKey ) || 'null' );
			if ( saved && saved.n === recipe.steps.length ) {
				state.step = Math.min( Math.max( 0, saved.step | 0 ), recipe.steps.length - 1 );
				state.checked = Array.isArray( saved.checked ) ? saved.checked : [];
				state.tab = 'steps' === saved.tab ? 'steps' : 'ingredients';
			}
			var size = parseInt( window.localStorage.getItem( 'wakechef-cook-view-size' ), 10 );
			if ( size >= 0 && size <= 3 ) {
				state.size = size;
			}
		} catch ( e ) {
			// Storage can be blocked; the view still works without it.
		}
	}

	function save() {
		try {
			window.sessionStorage.setItem( storeKey, JSON.stringify( { n: recipe.steps.length, step: state.step, checked: state.checked, tab: state.tab } ) );
			window.localStorage.setItem( 'wakechef-cook-view-size', String( state.size ) );
		} catch ( e ) {
			// Ignore.
		}
	}

	function el( tag, className, content ) {
		var node = document.createElement( tag );
		if ( className ) {
			node.className = className;
		}
		if ( content ) {
			node.textContent = content;
		}
		return node;
	}

	function button( className, label, icon ) {
		var b = el( 'button', className );
		b.type = 'button';
		if ( icon ) {
			b.setAttribute( 'aria-label', label );
			b.innerHTML = icon;
		} else {
			b.textContent = label;
		}
		return b;
	}

	function format( template, a, b ) {
		return String( template || '' ).replace( '%1$s', a ).replace( '%2$s', b ).replace( '%s', a );
	}

	var ICON_CLOSE = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

	function build( color ) {
		view = el( 'div', 'wakechef-cook-view' );
		view.setAttribute( 'role', 'dialog' );
		view.setAttribute( 'aria-modal', 'true' );
		view.setAttribute( 'aria-labelledby', 'wakechef-cook-view-title' );
		view.style.setProperty( '--wakechef-cook-mode-color', color );

		var head = el( 'div', 'wakechef-cook-view__head' );
		var titles = el( 'div', 'wakechef-cook-view__titles' );
		var title = el( 'h2', 'wakechef-cook-view__title', recipe.name );
		title.id = 'wakechef-cook-view-title';
		titles.appendChild( title );
		var meta = el( 'p', 'wakechef-cook-view__meta' );
		if ( recipe.yield ) {
			meta.appendChild( el( 'span', '', format( text.yield, recipe.yield ) ) );
		}
		meta.appendChild( el( 'span', 'wakechef-cook-view__awake', text.awake ) );
		titles.appendChild( meta );
		head.appendChild( titles );

		var tools = el( 'div', 'wakechef-cook-view__tools' );
		var smaller = button( 'wakechef-cook-view__size is-smaller', text.smaller, '<span aria-hidden="true">A</span>' );
		var larger = button( 'wakechef-cook-view__size is-larger', text.larger, '<span aria-hidden="true">A</span>' );
		var close = button( 'wakechef-cook-view__close', text.close, ICON_CLOSE );
		tools.appendChild( smaller );
		tools.appendChild( larger );
		tools.appendChild( close );
		head.appendChild( tools );
		view.appendChild( head );

		// Tabs are shown on narrow screens; wide screens show both panels side by side.
		var tabs = el( 'div', 'wakechef-cook-view__tabs' );
		tabs.setAttribute( 'role', 'tablist' );
		var tabIngredients = button( 'wakechef-cook-view__tab', text.ingredients );
		var tabSteps = button( 'wakechef-cook-view__tab', text.steps );
		[ [ tabIngredients, 'ingredients' ], [ tabSteps, 'steps' ] ].forEach( function ( pair ) {
			pair[ 0 ].setAttribute( 'role', 'tab' );
			pair[ 0 ].id = 'wakechef-cook-view-tab-' + pair[ 1 ];
			pair[ 0 ].setAttribute( 'aria-controls', 'wakechef-cook-view-' + pair[ 1 ] );
			pair[ 0 ].addEventListener( 'click', function () {
				state.tab = pair[ 1 ];
				update();
			} );
			tabs.appendChild( pair[ 0 ] );
		} );
		view.appendChild( tabs );

		var body = el( 'div', 'wakechef-cook-view__body' );

		var ingredients = el( 'section', 'wakechef-cook-view__ingredients' );
		ingredients.id = 'wakechef-cook-view-ingredients';
		ingredients.setAttribute( 'aria-labelledby', 'wakechef-cook-view-ingredients-title' );
		var ingredientsTitle = el( 'h3', 'wakechef-cook-view__heading', text.ingredients );
		ingredientsTitle.id = 'wakechef-cook-view-ingredients-title';
		ingredients.appendChild( ingredientsTitle );
		if ( recipe.ingredients.length ) {
			var list = el( 'ul', 'wakechef-cook-view__list' );
			recipe.ingredients.forEach( function ( ingredient, index ) {
				var item = el( 'li' );
				var label = el( 'label' );
				var box = el( 'input' );
				box.type = 'checkbox';
				box.checked = state.checked.indexOf( index ) !== -1;
				box.addEventListener( 'change', function () {
					var at = state.checked.indexOf( index );
					if ( box.checked && at === -1 ) {
						state.checked.push( index );
					} else if ( ! box.checked && at !== -1 ) {
						state.checked.splice( at, 1 );
					}
					save();
				} );
				label.appendChild( box );
				label.appendChild( el( 'span', '', ingredient ) );
				item.appendChild( label );
				list.appendChild( item );
			} );
			ingredients.appendChild( list );
		} else {
			ingredients.appendChild( el( 'p', '', text.noIngredients ) );
		}
		body.appendChild( ingredients );

		var steps = el( 'section', 'wakechef-cook-view__steps' );
		steps.id = 'wakechef-cook-view-steps';
		steps.setAttribute( 'aria-labelledby', 'wakechef-cook-view-counter' );
		var counter = el( 'h3', 'wakechef-cook-view__heading wakechef-cook-view__counter' );
		counter.id = 'wakechef-cook-view-counter';
		var progress = el( 'div', 'wakechef-cook-view__progress' );
		progress.appendChild( el( 'span' ) );
		var section = el( 'p', 'wakechef-cook-view__section' );
		var current = el( 'p', 'wakechef-cook-view__step' );
		current.setAttribute( 'aria-live', 'polite' );
		steps.appendChild( counter );
		steps.appendChild( progress );
		steps.appendChild( section );
		steps.appendChild( current );
		body.appendChild( steps );
		view.appendChild( body );

		var foot = el( 'div', 'wakechef-cook-view__foot' );
		var reset = button( 'wakechef-cook-view__reset', text.reset );
		var prev = button( 'wakechef-cook-view__prev', text.previous );
		var next = button( 'wakechef-cook-view__next', text.next );
		foot.appendChild( reset );
		foot.appendChild( prev );
		foot.appendChild( next );
		view.appendChild( foot );

		function go( delta ) {
			var target = state.step + delta;
			if ( target >= recipe.steps.length ) {
				emit( 'cookview:finish', { recipe: recipe, view: view } );
				closeView();
				return;
			}
			state.step = Math.max( 0, target );
			state.tab = 'steps';
			update();
		}

		prev.addEventListener( 'click', function () {
			go( -1 );
		} );
		next.addEventListener( 'click', function () {
			go( 1 );
		} );
		reset.addEventListener( 'click', function () {
			state.step = 0;
			state.checked = [];
			state.tab = 'ingredients';
			Array.prototype.forEach.call( view.querySelectorAll( '.wakechef-cook-view__list input' ), function ( box ) {
				box.checked = false;
			} );
			update();
		} );
		smaller.addEventListener( 'click', function () {
			state.size = Math.max( 0, state.size - 1 );
			update();
		} );
		larger.addEventListener( 'click', function () {
			state.size = Math.min( 3, state.size + 1 );
			update();
		} );
		close.addEventListener( 'click', closeView );

		// In right-to-left languages the next step is to the left.
		var rtl = 'rtl' === getComputedStyle( document.documentElement ).direction;

		view.addEventListener( 'keydown', function ( event ) {
			if ( 'Escape' === event.key ) {
				event.preventDefault();
				closeView();
			} else if ( 'Tab' === event.key ) {
				trapFocus( event );
			} else if ( ( 'ArrowRight' === event.key || 'ArrowLeft' === event.key ) && ! /^(INPUT|TEXTAREA|SELECT)$/.test( event.target.tagName ) ) {
				event.preventDefault();
				go( ( 'ArrowRight' === event.key ) !== rtl ? 1 : -1 );
			}
		} );

		// Swipe left or right on the step to move between steps.
		var startX = null;
		var startY = null;
		steps.addEventListener( 'touchstart', function ( event ) {
			startX = event.touches[ 0 ].clientX;
			startY = event.touches[ 0 ].clientY;
		}, { passive: true } );
		steps.addEventListener( 'touchend', function ( event ) {
			if ( null === startX ) {
				return;
			}
			var dx = event.changedTouches[ 0 ].clientX - startX;
			var dy = event.changedTouches[ 0 ].clientY - startY;
			startX = null;
			if ( Math.abs( dx ) > 50 && Math.abs( dx ) > Math.abs( dy ) * 1.5 ) {
				go( ( dx < 0 ) !== rtl ? 1 : -1 );
			}
		} );

		function update() {
			var n = recipe.steps.length;
			var step = recipe.steps[ state.step ];
			counter.textContent = format( text.stepOf, state.step + 1, n );
			progress.firstChild.style.width = ( ( state.step + 1 ) / n ) * 100 + '%';
			section.textContent = step.section;
			section.hidden = ! step.section;
			current.textContent = step.text;
			prev.disabled = 0 === state.step;
			next.textContent = state.step === n - 1 ? text.finish : text.next;
			view.setAttribute( 'data-size', String( state.size ) );
			view.setAttribute( 'data-tab', state.tab );
			smaller.disabled = 0 === state.size;
			larger.disabled = 3 === state.size;
			tabIngredients.setAttribute( 'aria-selected', String( 'ingredients' === state.tab ) );
			tabSteps.setAttribute( 'aria-selected', String( 'steps' === state.tab ) );
			save();
			emit( 'cookview:step', { recipe: recipe, view: view, index: state.step, step: step, element: current } );
		}

		view.update = update;
		document.body.appendChild( view );
	}

	function focusable() {
		return Array.prototype.filter.call(
			view.querySelectorAll( 'button, input, [href], [tabindex]:not([tabindex="-1"])' ),
			function ( node ) {
				return ! node.disabled && null !== node.offsetParent;
			}
		);
	}

	function trapFocus( event ) {
		var nodes = focusable();
		if ( ! nodes.length ) {
			return;
		}
		var first = nodes[ 0 ];
		var last = nodes[ nodes.length - 1 ];
		if ( event.shiftKey && document.activeElement === first ) {
			event.preventDefault();
			last.focus();
		} else if ( ! event.shiftKey && document.activeElement === last ) {
			event.preventDefault();
			first.focus();
		}
	}

	function openView( event ) {
		opener = event.currentTarget;
		var toggle = opener.closest( '.wakechef-cook-mode' );
		var color = toggle ? getComputedStyle( toggle ).getPropertyValue( '--wakechef-cook-mode-color' ).trim() : '';
		if ( ! view ) {
			load();
			build( color || '#2271b1' );
		}
		view.update();
		view.hidden = false;
		document.documentElement.classList.add( 'wakechef-cook-view-open' );
		wasWanted = wanted;
		if ( ! wanted ) {
			enable();
		}
		view.querySelector( '.wakechef-cook-view__close' ).focus();
		emit( 'cookview:open', { recipe: recipe, view: view } );
	}

	function closeView() {
		view.hidden = true;
		document.documentElement.classList.remove( 'wakechef-cook-view-open' );
		// Keep the screen awake only if Cook Mode was on before the view opened.
		if ( ! wasWanted ) {
			disable();
		}
		if ( opener ) {
			opener.focus();
		}
		emit( 'cookview:close', { recipe: recipe, view: view } );
	}

	/* ------------------------------------------------------------------
	 * Start
	 * ------------------------------------------------------------------ */

	function init() {
		var all = toggles();
		if ( ! all.length ) {
			return;
		}

		recipe = findRecipe();
		if ( recipe ) {
			all.forEach( function ( toggle ) {
				var wrap = toggle.querySelector( '.wakechef-cook-mode__start-wrap' );
				if ( wrap ) {
					wrap.hidden = false;
					wrap.querySelector( 'button' ).addEventListener( 'click', openView );
				}
			} );
		}

		if ( ! supported ) {
			all.forEach( function ( toggle ) {
				toggle.querySelector( '.wakechef-cook-mode__input' ).disabled = true;
				toggle.classList.add( 'is-unsupported' );
				toggle.querySelector( '.wakechef-cook-mode__status' ).textContent = strings.unsupported || '';
			} );
			return;
		}

		all.forEach( function ( toggle ) {
			toggle.querySelector( '.wakechef-cook-mode__input' ).addEventListener( 'change', function ( event ) {
				if ( event.target.checked ) {
					enable();
				} else {
					disable();
				}
				emit( 'cookmode:change', { on: event.target.checked } );
			} );
		} );

		document.addEventListener( 'visibilitychange', function () {
			if ( wanted && ! wakeLock && 'visible' === document.visibilityState ) {
				acquire().catch( function () {
					render( strings.paused, 'paused' );
				} );
			}
		} );
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
}() );
