exports.up = knex => {
    return knex.schema
        .createTable('roles', table => {
            table.increments();
            table.json('info');
            table.timestamps();
        })

        .createTable('user-roles', table => {
            table.increments();
            table.string('name');
            table.json('roles');
            table.timestamps();
        })

        .createTable('custom-users', table => {
            table.increments();
            table.string('username');
            table.string('password');
            table.string('display');
            table.string('email');
            table.timestamps();
        })

        // .createTable('imported-entities', table => {
        //     table.increments();
        //     table.json('entity');
        //     table.json('groups');
        //     table.json('roles');
        //     table.string('kind');
        //     table.timestamps();
        // });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
    return knex.schema
        .dropTable('user-roles')
        .dropTable('roles')
        .dropTable('custom-users');
};
