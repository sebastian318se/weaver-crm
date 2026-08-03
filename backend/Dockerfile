# BUILD IMAGE
# Define build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

# Define working directory
WORKDIR /src

# Copy csproj and rest of project separately to avoid expensive restoring
COPY tenniscrm.csproj .
RUN dotnet restore
COPY . .

RUN dotnet publish -c Release -o /app/publish

# RUNTIME IMAGE
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

# Copy only app/publish from build 
COPY --from=build /app/publish .

# Listen on port 8080
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "tenniscrm.dll"]