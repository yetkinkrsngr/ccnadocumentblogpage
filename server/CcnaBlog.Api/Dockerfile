# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore
COPY CcnaBlog.Api.csproj .
RUN dotnet restore

# Publish
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:5153
EXPOSE 5153
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CcnaBlog.Api.dll"]

