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
        .dropTable('roles');
};
