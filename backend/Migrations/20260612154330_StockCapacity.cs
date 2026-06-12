using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tenniscrm.Migrations
{
    /// <inheritdoc />
    public partial class StockCapacity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductStockCapacity",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductStockCapacity",
                table: "Products");
        }
    }
}
