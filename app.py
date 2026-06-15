import os
import xml.etree.ElementTree as ET
import urllib.request
import re
import hashlib
from flask import Flask, jsonify, render_template

app = Flask(__name__, template_folder='templates', static_folder='static')

# Namespaces for Atom feed parsing
NAMESPACES = {
    'atom': 'http://www.w3.org/2005/Atom'
}

def clean_and_absolute_links(html_content):
    """Converts relative URLs in href attributes to absolute Google Cloud URLs."""
    if not html_content:
        return ""
    # Replace relative hrefs starting with '/' with absolute URLs
    html_content = re.sub(
        r'href=["\']/([^"\']*)["\']',
        r'href="https://cloud.google.com/\1"',
        html_content
    )
    return html_content

def parse_release_notes():
    """Fetches and parses the BigQuery release notes XML feed."""
    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityClient/1.0'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()

        root = ET.fromstring(xml_data)
        updates = []

        for entry in root.findall('atom:entry', NAMESPACES):
            date_str = entry.find('atom:title', NAMESPACES).text.strip()
            updated_str = entry.find('atom:updated', NAMESPACES).text.strip()
            
            link_elem = entry.find('atom:link', NAMESPACES)
            link = link_elem.attrib.get('href', '') if link_elem is not None else ''

            content_elem = entry.find('atom:content', NAMESPACES)
            if content_elem is None or content_elem.text is None:
                continue

            content_html = content_elem.text

            # Split the entry's content by <h3> headers to get individual updates
            # Example: <h3>Feature</h3>\n<p>...</p>\n<h3>Breaking</h3>\n<p>...</p>
            parts = re.split(r'<h3>(.*?)</h3>', content_html)

            # The split list will have an empty or whitespace-only first element if the content
            # starts with <h3>. Subsequent elements alternate: category, content, category, content...
            if len(parts) > 1:
                # If the first part has content (e.g. text before first h3), we skip it as it's typically whitespace
                start_idx = 1
                for i in range(start_idx, len(parts), 2):
                    category = parts[i].strip()
                    desc_html = parts[i+1].strip() if i+1 < len(parts) else ""
                    
                    # Clean links to make them absolute
                    desc_html = clean_and_absolute_links(desc_html)

                    # Generate a unique, stable ID for this specific update
                    unique_str = f"{date_str}_{category}_{desc_html}"
                    update_id = hashlib.md5(unique_str.encode('utf-8')).hexdigest()[:12]

                    updates.append({
                        'id': update_id,
                        'date': date_str,
                        'category': category,
                        'content': desc_html,
                        'link': link
                    })
            else:
                # If there are no <h3> tags, treat the whole content as a single update with category "General"
                desc_html = clean_and_absolute_links(content_html)
                unique_str = f"{date_str}_General_{desc_html}"
                update_id = hashlib.md5(unique_str.encode('utf-8')).hexdigest()[:12]
                
                updates.append({
                    'id': update_id,
                    'date': date_str,
                    'category': 'General',
                    'content': desc_html,
                    'link': link
                })

        return updates, None
    except Exception as e:
        return None, str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/release-notes')
def get_release_notes():
    notes, error = parse_release_notes()
    if error:
        return jsonify({'success': False, 'error': error}), 500
    return jsonify({'success': True, 'notes': notes})

if __name__ == '__main__':
    # Default to port 5000 or the PORT environment variable
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
