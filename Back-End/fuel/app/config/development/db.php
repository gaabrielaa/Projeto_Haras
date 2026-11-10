<?php
// Conexão com o banco "haras" (MySQL)
return array(
    'default' => array(
        'type' => 'mysqli',
        'connection' => array(
            'hostname' => 'localhost',
            'port' => '3306',
            'database' => 'haras',
            'username' => 'root',
            'password' => 'admin123',
            'persistent' => false,
        ),
        'identifier' => '`',
        'table_prefix' => '',
        'charset' => 'utf8mb4',
        'enable_cache' => true,
        'profiling' => false,
    ),
);