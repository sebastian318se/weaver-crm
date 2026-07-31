using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tenniscrm.Migrations
{
    /// <inheritdoc />
    public partial class Plural : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Tenant_TenantId",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Tenant_TenantId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Tenant_TenantId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Tenant_TenantId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_User_Tenant_TenantId",
                table: "User");

            migrationBuilder.DropPrimaryKey(
                name: "PK_User",
                table: "User");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tenant",
                table: "Tenant");

            migrationBuilder.RenameTable(
                name: "User",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "Tenant",
                newName: "Tentants");

            migrationBuilder.RenameIndex(
                name: "IX_User_TenantId",
                table: "Users",
                newName: "IX_Users_TenantId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "UserId");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tentants",
                table: "Tentants");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "User");

            migrationBuilder.RenameTable(
                name: "Tentants",
                newName: "Tenant");

            migrationBuilder.RenameIndex(
                name: "IX_Users_TenantId",
                table: "User",
                newName: "IX_User_TenantId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_User",
                table: "User",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tenant",
                table: "Tenant",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Tenant_TenantId",
                table: "Customers",
                column: "TenantId",
                principalTable: "Tenant",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Tenant_TenantId",
                table: "Orders",
                column: "TenantId",
                principalTable: "Tenant",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Tenant_TenantId",
                table: "Products",
                column: "TenantId",
                principalTable: "Tenant",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Tenant_TenantId",
                table: "Transactions",
                column: "TenantId",
                principalTable: "Tenant",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_User_Tenant_TenantId",
                table: "User",
                column: "TenantId",
                principalTable: "Tenant",
                principalColumn: "TenantId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
