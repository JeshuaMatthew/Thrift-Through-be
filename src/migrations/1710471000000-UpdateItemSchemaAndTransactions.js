const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class UpdateItemSchemaAndTransactions1710471000000 {
    async up(queryRunner) {
        // Add transaction_type to items table
        await queryRunner.query(`ALTER TABLE items ADD COLUMN transaction_type VARCHAR(255) DEFAULT 'Uang';`);

        // Rename last_updated_price to last_price_analysis
        await queryRunner.query(`ALTER TABLE items RENAME COLUMN last_updated_price TO last_price_analysis;`);

        // Add AI price analysis fields
        await queryRunner.query(`ALTER TABLE items ADD COLUMN ai_price_analysis JSONB;`);
        await queryRunner.query(`ALTER TABLE items ADD COLUMN ai_price_analysis_text TEXT;`);

        // Add AI carbon analysis fields
        await queryRunner.query(`ALTER TABLE items ADD COLUMN ai_carbon_analysis JSONB;`);
        await queryRunner.query(`ALTER TABLE items ADD COLUMN ai_carbon_analysis_text TEXT;`);
        await queryRunner.query(`ALTER TABLE items ADD COLUMN last_carbon_analysis TIMESTAMP;`);
    }

    async down(queryRunner) {
        // Revert AI carbon analysis fields
        await queryRunner.query(`ALTER TABLE items DROP COLUMN last_carbon_analysis;`);
        await queryRunner.query(`ALTER TABLE items DROP COLUMN ai_carbon_analysis_text;`);
        await queryRunner.query(`ALTER TABLE items DROP COLUMN ai_carbon_analysis;`);

        // Revert AI price analysis fields
        await queryRunner.query(`ALTER TABLE items DROP COLUMN ai_price_analysis_text;`);
        await queryRunner.query(`ALTER TABLE items DROP COLUMN ai_price_analysis;`);

        // Rename back last_price_analysis to last_updated_price
        await queryRunner.query(`ALTER TABLE items RENAME COLUMN last_price_analysis TO last_updated_price;`);

        // Remove transaction_type
        await queryRunner.query(`ALTER TABLE items DROP COLUMN transaction_type;`);
    }
}
