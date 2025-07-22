import { NextResponse } from 'next/server';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Control, Technician } from '@/lib/types';

// GET /api/controls/extract - Generate HTML file with all controls
export async function GET() {
  try {
    // Fetch all controls and technicians
    const [controlsSnapshot, techniciansSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'controls'), orderBy('order', 'asc'))),
      getDocs(collection(db, 'technicians'))
    ]);

    // Process controls data
    const controls = controlsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Control[];

    // Process technicians data
    const technicians = techniciansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Technician[];

    // Create a map for easy technician lookup
    const technicianMap = new Map(technicians.map(tech => [tech.id, tech]));

    // Generate HTML content
    const html = generateHTMLReport(controls, technicianMap);

    // Return HTML file
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="controls-export.html"'
      }
    });

  } catch (error) {
    console.error("Error generating controls extract:", error);
    return NextResponse.json({ message: 'Failed to generate extract' }, { status: 500 });
  }
}

function generateHTMLReport(controls: Control[], technicianMap: Map<string, Technician>): string {
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  // Group controls by status for better organization
  const controlsByStatus = {
    'In Progress': controls.filter(c => c.status === 'In Progress'),
    'In Review': controls.filter(c => c.status === 'In Review'),
    'Complete': controls.filter(c => c.status === 'Complete')
  };

  const generateControlRows = (controlList: Control[]) => {
    return controlList.map(control => {
      const technician = control.assigneeId ? technicianMap.get(control.assigneeId) : null;
      const technicianName = technician ? technician.name : 'Unassigned';
      
      // Handle URLs - show both ticket URL and details URL if available
      let urlsHtml = '';
      if (control.ticketUrl || control.externalUrl) {
        const urls: string[] = [];
        if (control.ticketUrl) {
          urls.push(`<a href="${control.ticketUrl}" target="_blank" class="url-link ticket-url">Ticket ${control.ticketNumber || ''}</a>`);
        }
        if (control.externalUrl) {
          urls.push(`<a href="${control.externalUrl}" target="_blank" class="url-link details-url">Details</a>`);
        }
        urlsHtml = urls.join('<br>');
      } else {
        urlsHtml = '<span class="no-url">No URLs available</span>';
      }

      return `
        <tr class="control-row">
          <td class="dcf-cell">
            <span class="dcf-badge">${control.dcfId}</span>
          </td>
          <td class="task-cell">
            <div class="task-title">${control.title}</div>
            <div class="task-description">${control.explanation.substring(0, 100)}${control.explanation.length > 100 ? '...' : ''}</div>
          </td>
          <td class="url-cell">
            ${urlsHtml}
          </td>
                     <td class="technician-cell">
             <div class="technician-name">${technicianName}</div>
             ${technician && technician.email ? `<div class="technician-email">${technician.email}</div>` : ''}
           </td>
           <td class="date-cell">
             ${control.estimatedCompletionDate ? 
               new Date(control.estimatedCompletionDate.seconds * 1000).toLocaleDateString() : 
               'No date set'}
           </td>
        </tr>
      `;
    }).join('');
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ISO 27001:2022 Controls Export - ${currentDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .export-info {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .stats {
            display: flex;
            gap: 30px;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            min-width: 150px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #4f46e5;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        .section {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            overflow: hidden;
        }
        
        .section-header {
            padding: 20px 30px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 1.3rem;
            font-weight: 600;
            color: #1f2937;
        }
        
        .status-in-progress .section-header {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .status-in-review .section-header {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-complete .section-header {
            background: #d1fae5;
            color: #065f46;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background: #f9fafb;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: top;
        }
        
        .control-row:hover {
            background-color: #f8fafc;
        }
        
        .dcf-badge {
            background: #4f46e5;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9rem;
            font-family: 'Courier New', monospace;
        }
        
        .task-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
            font-size: 1rem;
        }
        
        .task-description {
            color: #6b7280;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .url-link {
            display: inline-block;
            color: #4f46e5;
            text-decoration: none;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #e0e7ff;
            margin: 2px 0;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .url-link:hover {
            background: #4f46e5;
            color: white;
        }
        
        .ticket-url {
            background: #fef3c7;
            color: #92400e;
            border-color: #fcd34d;
        }
        
        .ticket-url:hover {
            background: #f59e0b;
            color: white;
        }
        
        .no-url {
            color: #9ca3af;
            font-style: italic;
            font-size: 0.9rem;
        }
        
        .technician-name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .technician-email {
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-in-progress {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .status-in-review {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-complete {
            background: #d1fae5;
            color: #065f46;
        }
        
        .date-cell {
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: #6b7280;
        }
        
        .empty-section {
            padding: 40px;
            text-align: center;
            color: #9ca3af;
            font-style: italic;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .section {
                box-shadow: none;
                border: 1px solid #e5e7eb;
                page-break-inside: avoid;
            }
            
            .header {
                background: #4f46e5 !important;
                -webkit-print-color-adjust: exact;
            }
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8rem;
            }
            
            .header-info {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .stats {
                justify-content: center;
            }
            
            table {
                font-size: 0.9rem;
            }
            
            th, td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>ISO 27001:2022 Compliance Controls</h1>
        <div class="header-info">
            <div class="export-info">
                <div>Export Date: ${currentDate} at ${currentTime}</div>
                <div>Total Controls: ${controls.length}</div>
            </div>
        </div>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${controls.length}</div>
            <div class="stat-label">Total Controls</div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            All Controls (${controls.length})
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 120px;">DCF #</th>
                    <th style="width: 40%;">Task Name</th>
                    <th style="width: 25%;">URLs</th>
                    <th style="width: 25%;">Technician</th>
                    <th style="width: 120px;">Due Date</th>
                </tr>
            </thead>
            <tbody>
                ${generateControlRows(controls)}
            </tbody>
        </table>
    </div>
    
    <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.9rem;">
        <p>Generated from ISO Tracker Application</p>
        <p>This report contains ${controls.length} compliance controls as of ${currentDate}</p>
    </div>
</body>
</html>
  `.trim();
} 