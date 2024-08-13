const fs = require('fs/promises');

async function updateSystemPrompt() {
  try {
    // 1. Read the content of systemPrompt.txt
    const systemPromptContent = await fs.readFile('systemPrompt.txt', 'utf-8');

    // 2. Replace content as specified
    const currentDateTime = new Date().toISOString();
    const updatedContent = systemPromptContent
      .replace("<DATE_TIME>", currentDateTime)
      .replace(/"/g, '\"')
      .replace(/\n/g, '\n');

    // 3. Output the new content
    console.log('Updated system prompt content:');
    console.log(updatedContent);

    // Read the config.json file
    const configContent = await fs.readFile('../config.json', 'utf-8');
    const config = JSON.parse(configContent);

    // Update the systemPrompt field
    config.systemPrompt = updatedContent;

    // Write the updated config back to the file
    await fs.writeFile('../config.json', JSON.stringify(config, null, 2));

    console.log('config.json has been updated successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

updateSystemPrompt();