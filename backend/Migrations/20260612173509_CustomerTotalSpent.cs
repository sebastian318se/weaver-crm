using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tenniscrm.Migrations
{
    /// <inheritdoc />
    public partial class CustomerTotalSpent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TotalSpent",
                table: "Customers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalSpent",
                table: "Customers");
        }
    }
}
