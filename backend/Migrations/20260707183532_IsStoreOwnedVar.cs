using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tenniscrm.Migrations
{
    /// <inheritdoc />
    public partial class IsStoreOwnedVar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsReel",
                table: "Products",
                newName: "IsStoreOwned");

            migrationBuilder.AddColumn<bool>(
                name: "IsStoreOwned",
                table: "Orders",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsStoreOwned",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "IsStoreOwned",
                table: "Products",
                newName: "IsReel");
        }
    }
}
