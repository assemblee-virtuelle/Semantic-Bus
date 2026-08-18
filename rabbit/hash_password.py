#!/usr/bin/env python3
"""
Régénère le password_hash RabbitMQ (SHA-256) du user stomp-user dans
rabbit/rabbitmq-definitions.json, pour un nouveau mot de passe.

Usage:
    python3 rabbit/hash_password.py <nouveau-mot-de-passe>

Après exécution, rejouer les définitions (make rabbit-reset) et aligner le
mot de passe en clair sur les services (env AMQP_STOMP_PASSWORD /
config amqpStompPassword) ainsi que sur l'API /data/auth/stomp-credentials.
"""
import base64
import hashlib
import json
import os
import sys

RABBIT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFS_PATH = os.path.join(RABBIT_DIR, 'rabbitmq-definitions.json')


def rabbit_hash(password: str) -> str:
    # Sel de 4 octets (comme rabbitmqctl hash_password)
    salt = os.urandom(4)
    dk = hashlib.sha256(password.encode('utf-8') + salt).digest()
    return base64.b64encode(dk + salt).decode()


def main() -> None:
    if len(sys.argv) < 2 or not sys.argv[1]:
        print(__doc__)
        sys.exit(1)

    password = sys.argv[1]
    new_hash = rabbit_hash(password)

    with open(DEFS_PATH, 'r', encoding='utf-8') as f:
        defs = json.load(f)

    found = False
    for user in defs.get('users', []):
        if user.get('name') == 'stomp-user':
            user['password_hash'] = new_hash
            found = True

    if not found:
        print('ERREUR : user "stomp-user" introuvable dans les définitions.')
        sys.exit(1)

    with open(DEFS_PATH, 'w', encoding='utf-8') as f:
        json.dump(defs, f, indent=2)
        f.write('\n')

    print(f'OK : password_hash de stomp-user mis à jour dans {DEFS_PATH}')
    print('Nouveau hash :', new_hash)
    print()
    print('Étapes suivantes :')
    print('  1. Rejouer les définitions : make rabbit-reset')
    print('  2. Aligner le mot de passe en clair sur les services :')
    print('     export AMQP_STOMP_LOGIN=stomp-user')
    print('     export AMQP_STOMP_PASSWORD=<le nouveau mot de passe>')
    print('  3. Aligner la config de l\'API (/data/auth/stomp-credentials) :')
    print('     config amqpStompPassword OU env AMQP_STOMP_PASSWORD')


if __name__ == '__main__':
    main()
