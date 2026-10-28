<?php
/**
 * Removes the plugin's settings.
 *
 * @package WakeChef_Cook_Mode
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'wakechef_cook_mode_settings' );
