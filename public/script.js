// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/data')
        .then((response) => response.json())
        .then((data) => {
            const dataTable = document.getElementById('data-table');
            
            // Create table header row
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
            `;
            dataTable.appendChild(headerRow);

            // Populate data rows
            data.forEach((row) => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.name}</td>
                    <td>${row.email}</td>
                `;
                dataTable.appendChild(newRow);
            });
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
});

