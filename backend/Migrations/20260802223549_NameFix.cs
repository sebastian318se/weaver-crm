using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tenniscrm.Migrations
{
    /// <inheritdoc />
    public partial class NameFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Tentants_TenantId",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Tentants_TenantId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Tentants_TenantId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Tentants_TenantId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Tentants_TenantId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tentants",
                table: "Tentants");

            migrationBuilder.RenameTable(
                name: "Tentants",
                newName: "Tenants");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tenants",
                table: "Tenants",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Tenants_TenantId",
                table: "Customers",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Tenants_TenantId",
                table: "Orders",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Tenants_TenantId",
                table: "Products",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Tenants_TenantId",
                table: "Transactions",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Tenants_TenantId",
                table: "Users",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Tenants_TenantId",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Tenants_TenantId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Tenants_TenantId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Tenants_TenantId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Tenants_TenantId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tenants",
                table: "Tenants");

            migrationBuilder.RenameTable(
                name: "Tenants",
                newName: "Tentants");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tentants",
                table: "Tentants",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Tentants_TenantId",
                table: "Customers",
                column: "TenantId",
                principalTable: "Tentants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Tentants_TenantId",
                table: "Orders",
                column: "TenantId",
                principalTable: "Tentants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Tentants_TenantId",
                table: "Products",
                column: "TenantId",
                principalTable: "Tentants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Tentants_TenantId",
                table: "Transactions",
                column: "TenantId",
                principalTable: "Tentants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Tentants_TenantId",
                table: "Users",
                column: "TenantId",
                principalTable: "Tentants",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
