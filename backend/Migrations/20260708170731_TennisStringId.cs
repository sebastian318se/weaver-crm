using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tenniscrm.Migrations
{
    /// <inheritdoc />
    public partial class TennisStringId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Products_TennisStringProductId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "StringId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "TennisStringProductId",
                table: "Orders",
                newName: "TennisStringId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_TennisStringProductId",
                table: "Orders",
                newName: "IX_Orders_TennisStringId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Products_TennisStringId",
                table: "Orders",
                column: "TennisStringId",
                principalTable: "Products",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Products_TennisStringId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "TennisStringId",
                table: "Orders",
                newName: "TennisStringProductId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_TennisStringId",
                table: "Orders",
                newName: "IX_Orders_TennisStringProductId");

            migrationBuilder.AddColumn<int>(
                name: "StringId",
                table: "Orders",
                type: "integer",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Products_TennisStringProductId",
                table: "Orders",
                column: "TennisStringProductId",
                principalTable: "Products",
                principalColumn: "ProductId");
        }
    }
}
