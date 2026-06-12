using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tenniscrm.Migrations
{
    /// <inheritdoc />
    public partial class RacketsStrung : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RacketsStrung",
                table: "Customers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RacketsStrung",
                table: "Customers");
        }
    }
}
