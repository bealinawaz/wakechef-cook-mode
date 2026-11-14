<?php
/**
 * Plugin Name:       WakeChef Cook Mode
 * Plugin URI:        https://wordpress.org/plugins/wakechef-cook-mode/
 * Description:       Adds a Cook Mode toggle that keeps visitors' screens awake while they follow a recipe. Works with WP Recipe Maker cards, any post type, a shortcode, or a block.
 * Version:           1.1.1
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Ali Nawaz
 * Author URI:        https://bealinawaz.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wakechef-cook-mode
 * Domain Path:       /languages
 *
 * @package WakeChef_Cook_Mode
 */

defined( 'ABSPATH' ) || exit;

define( 'WAKECHEF_COOK_MODE_VERSION', '1.1.1' );
define( 'WAKECHEF_COOK_MODE_FILE', __FILE__ );
define( 'WAKECHEF_COOK_MODE_URL', plugin_dir_url( __FILE__ ) );

require_once __DIR__ . '/includes/class-wakechef-cook-mode-settings.php';
require_once __DIR__ . '/includes/class-wakechef-cook-mode.php';

WakeChef_Cook_Mode::init();

if ( is_admin() ) {
	require_once __DIR__ . '/includes/class-wakechef-cook-mode-admin.php';
	WakeChef_Cook_Mode_Admin::init();
}
