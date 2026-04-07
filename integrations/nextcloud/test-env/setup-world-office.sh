#!/bin/bash
set -e

# Wait for World Office Document Server to be ready
echo "Waiting for World Office Document Server..."
until curl -sf http://worldoffice-docs/healthcheck > /dev/null 2>&1; do
    echo "  Waiting for http://worldoffice-docs/healthcheck..."
    sleep 5
done
echo "Document Server is ready!"

# Copy the worldoffice app into Nextcloud
echo "Copying worldoffice app to Nextcloud..."
# Always copy from the mounted volume to ensure we have the latest version
if [ -d /worldoffice-nextcloud ]; then
    rm -rf /var/www/html/apps/worldoffice
    cp -r /worldoffice-nextcloud /var/www/html/apps/worldoffice
    echo "App copied!"
else
    echo "ERROR: App source not found at /worldoffice-nextcloud"
    exit 1
fi

# Set proper permissions
echo "Setting permissions..."
chown -R www-data:www-data /var/www/html/apps/worldoffice
chmod -R 755 /var/www/html/apps/worldoffice

# Install PHP dependencies if composer.json exists
if [ -f /var/www/html/apps/worldoffice/composer.json ]; then
    echo "Installing PHP dependencies..."
    cd /var/www/html/apps/worldoffice
    
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

# Enable the worldoffice app if not already enabled
if ! php /var/www/html/occ app:list | grep -q "worldoffice.*\(enabled\)"; then
    echo "Enabling worldoffice app..."
    php /var/www/html/occ app:enable worldoffice
    echo "App enabled!"
else
    echo "worldoffice app already enabled."
fi

# Configure integration settings
echo "Configuring integration settings..."
php /var/www/html/occ config:app:set worldoffice DocumentServerUrl --value="http://localhost:8082/"
php /var/www/html/occ config:app:set worldoffice DocumentServerInternalUrl --value="http://worldoffice-docs/"
php /var/www/html/occ config:app:set worldoffice StorageUrl --value="http://nextcloud/"
php /var/www/html/occ config:app:set worldoffice jwt_secret --value="mysecret"
php /var/www/html/occ config:app:set worldoffice VerifyPeerOff --value="true"
php /var/www/html/occ config:app:set worldoffice preview --value="true"

echo "Configuration complete!"
echo ""
echo "Verify with:"
echo "  docker compose exec nextcloud php occ worldoffice:documentserver --check"
