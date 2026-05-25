using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace tenniscrm.Migrations
{
    /// <inheritdoc />
    public partial class MinimalApi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Order_Product_ProductId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_Product_RacketId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_Product_StringId",
                table: "Order");

            migrationBuilder.DropTable(
                name: "Product");

            migrationBuilder.DropIndex(
                name: "IX_Order_StringId",
                table: "Order");

            migrationBuilder.AddColumn<int>(
                name: "TenisStringProductId",
                table: "Order",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    ProductBrand = table.Column<string>(type: "text", nullable: false),
                    ProductImageUrl = table.Column<string>(type: "text", nullable: true),
                    ProductModel = table.Column<string>(type: "text", nullable: true),
                    ProductPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    Discriminator = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    BallSurface = table.Column<int>(type: "integer", nullable: true),
                    Clothing_Type = table.Column<int>(type: "integer", nullable: true),
                    Size = table.Column<int>(type: "integer", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: true),
                    MiscInfo = table.Column<string>(type: "text", nullable: true),
                    StringPattern = table.Column<string>(type: "text", nullable: true),
                    GripSize = table.Column<string>(type: "text", nullable: true),
                    HeadSize = table.Column<int>(type: "integer", nullable: true),
                    Weight = table.Column<int>(type: "integer", nullable: true),
                    SwingWeight = table.Column<int>(type: "integer", nullable: true),
                    BeamThickness = table.Column<int>(type: "integer", nullable: true),
                    Flex = table.Column<int>(type: "integer", nullable: true),
                    Length = table.Column<decimal>(type: "numeric", nullable: true),
                    ShoeSurface = table.Column<int>(type: "integer", nullable: true),
                    Shoe_Size = table.Column<decimal>(type: "numeric", nullable: true),
                    Material = table.Column<int>(type: "integer", nullable: true),
                    IsReel = table.Column<bool>(type: "boolean", nullable: true),
                    Gauge = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.ProductId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Order_TenisStringProductId",
                table: "Order",
                column: "TenisStringProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Products_ProductId",
                table: "Order",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Products_RacketId",
                table: "Order",
                column: "RacketId",
                principalTable: "Products",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Products_TenisStringProductId",
                table: "Order",
                column: "TenisStringProductId",
                principalTable: "Products",
                principalColumn: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Order_Products_ProductId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_Products_RacketId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_Products_TenisStringProductId",
                table: "Order");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Order_TenisStringProductId",
                table: "Order");

            migrationBuilder.DropColumn(
                name: "TenisStringProductId",
                table: "Order");

            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Discriminator = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    ProductBrand = table.Column<string>(type: "text", nullable: false),
                    ProductImageUrl = table.Column<string>(type: "text", nullable: false),
                    ProductModel = table.Column<string>(type: "text", nullable: true),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    ProductPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    BallSurface = table.Column<int>(type: "integer", nullable: true),
                    Size = table.Column<int>(type: "integer", nullable: true),
                    Clothing_Type = table.Column<int>(type: "integer", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: true),
                    MiscInfo = table.Column<string>(type: "text", nullable: true),
                    BeamThickness = table.Column<int>(type: "integer", nullable: true),
                    Flex = table.Column<int>(type: "integer", nullable: true),
                    GripSize = table.Column<string>(type: "text", nullable: true),
                    HeadSize = table.Column<int>(type: "integer", nullable: true),
                    Length = table.Column<decimal>(type: "numeric", nullable: true),
                    StringPattern = table.Column<string>(type: "text", nullable: true),
                    SwingWeight = table.Column<int>(type: "integer", nullable: true),
                    Weight = table.Column<int>(type: "integer", nullable: true),
                    ShoeSurface = table.Column<int>(type: "integer", nullable: true),
                    Shoe_Size = table.Column<decimal>(type: "numeric", nullable: true),
                    Gauge = table.Column<decimal>(type: "numeric", nullable: true),
                    IsReel = table.Column<bool>(type: "boolean", nullable: true),
                    Material = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.ProductId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Order_StringId",
                table: "Order",
                column: "StringId");

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Product_ProductId",
                table: "Order",
                column: "ProductId",
                principalTable: "Product",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Product_RacketId",
                table: "Order",
                column: "RacketId",
                principalTable: "Product",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Product_StringId",
                table: "Order",
                column: "StringId",
                principalTable: "Product",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
