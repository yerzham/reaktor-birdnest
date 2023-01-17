FROM denoland/deno:alpine-1.29.3

# Set the working directory
WORKDIR /app

# Copy the necessary files for the application
COPY . .

# Install any necessary dependencies
RUN deno cache src/deps.ts

# Expose the port that the application will run on
EXPOSE 3000

# Run the application with --watch option
CMD ["deno", "run", "--allow-net", "--allow-env", "src/server.ts"]
