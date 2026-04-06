#!/bin/bash
set -e

# Wait for Euro-Office Document Server to be ready
echo "Waiting for Euro-Office Document Server..."
until curl -sf http://world-office-docs/healthcheck > /dev/null 2>&1; do
    echo "  Waiting for http://world-office-docs/healthcheck..."
    sleep 5
done
echo "Document Server is ready!"

# Copy the world-office app into Nextcloud
echo "Copying Euro-Office app to Nextcloud..."
# Always copy from the mounted volume to ensure we have the latest version
if [ -d /world-office-nextcloud ]; then
    rm -rf /var/www/html/apps/world-office
    cp -r /world-office-nextcloud /var/www/html/apps/world-office
    echo "App copied!"
else
    echo "ERROR: App source not found at /world-office-nextcloud"
    exit 1
fi

# Set proper permissions
echo "Setting permissions..."
chown -R www-data:www-data /var/www/html/apps/world-office
chmod -R 755 /var/www/html/apps/world-office

# Install PHP dependencies if composer.json exists
if [ -f /var/www/html/apps/world-office/composer.json ]; then
    echo "Installing PHP dependencies..."
    cd /var/www/html/apps/world-office
    
    # Install composer if not present
    if ! command -v composer &> /dev/null; then
        echo "  Installing Composer..."
        curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    fi
    
    composer install --no-dev --optimize-autoloader --no-interaction
    echo "Dependencies installed!"
fi

# Set trusted domains
php /var/www/html/occ config:system:set trusted_domains 1 --value="localhost"
php /var/www/html/occ config:system:set trusted_domains 2 --value="127.0.0.1"
php /var/www/html/occ config:system:set trusted_domains 3 --value="172.24.0.0/16"
php /var/www/html/occ config:system:set trusted_domains 4 --value="nextcloud"

# Enable the world-office app if not already enabled
if ! php /var/www/html/occ app:list | grep -q "world-office.*\(enabled\)"; then
    echo "Enabling Euro-Office app..."
    php /var/www/html/occ app:enable world-office
    echo "App enabled!"
else
    echo "Euro-Office app already enabled."
fi

# Configure integration settings
echo "Configuring integration settings..."
php /var/www/html/occ config:app:set world-office DocumentServerUrl --value="http://localhost:8082/"
php /var/www/html/occ config:app:set world-office DocumentServerInternalUrl --value="http://world-office-docs/"
php /var/www/html/occ config:app:set world-office StorageUrl --value="http://nextcloud/"
php /var/www/html/occ config:app:set world-office jwt_secret --value="mysecret"
php /var/www/html/occ config:app:set world-office VerifyPeerOff --value="true"
php /var/www/html/occ config:app:set world-office preview --value="true"

echo "Configuration complete!"
echo ""
echo "Verify with:"
echo "  docker compose exec nextcloud php occ world-office:documentserver --check"
