import { Component, computed, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  FieldTree,
  FormField,
  FormRoot,
  form,
  required,
  schema
} from '@angular/forms/signals';

type FreeApiFormModel = {
  category: string;
  count: number;
};

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
}

@Component({
  selector: 'app-free-api',
  standalone: true,
  imports: [FormRoot, FormField],
  templateUrl: './free-api.component.html',
  styleUrls: ['./free-api.component.scss']
})
export class FreeApiComponent {
  protected readonly title = signal('Free API Explorer');
  protected readonly responseMessage = signal('No request made yet.');
  protected readonly responseData = signal<SafeHtml>('');
  protected readonly rawResponse = signal('');
  protected readonly isLoading = signal(false);

  protected readonly codeSnippets = computed(() =>
    this.generateCodeSnippets(this.formModel().category, this.formModel().count)
  );

  private readonly baseUrl = 'https://hook.us2.make.com/ybidwyfcxg9syplv73qholv336fdgaxs';

  constructor(private readonly sanitizer: DomSanitizer) {}

  protected readonly formModel = signal<FreeApiFormModel>({
    category: 'Top gaming laptops in US',
    count: 5
  });

  protected readonly apiForm = form(
    this.formModel,
    schema<FreeApiFormModel>((path) => {
      required(path.category, { message: 'Category is required.' });
      required(path.count, { message: 'Count is required.' });
    }),
    {
      submission: {
        action: async () => {
          const model = this.formModel();
          this.isLoading.set(true);
          this.responseMessage.set('Loading...');

          try {
            const response = await this.fetchData(model.category, model.count);
            this.displayResponse(response);
            this.responseMessage.set(`Request completed with status ${response.status} ${response.statusText}`);
          } catch (error) {
            this.responseMessage.set(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            this.responseData.set('');
            this.rawResponse.set('');
          } finally {
            this.isLoading.set(false);
          }

          return undefined;
        }
      }
    }
  );

  protected firstError(field: FieldTree<unknown>): string | null {
    const errors = field().errors();
    if (!errors.length) {
      return null;
    }
    return errors[0].message ?? 'Invalid field value.';
  }

  private async fetchData(category: string, count: number): Promise<ApiResponse> {
    try {
      const url = `${this.baseUrl}?catagory=${encodeURIComponent(category)}&count=${count}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  private displayResponse(response: ApiResponse): void {
    const headersHtml = Object.entries(response.headers)
      .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
      .join('');

    const dataHtml = typeof response.data === 'object'
      ? `<pre>${JSON.stringify(response.data, null, 2)}</pre>`
      : `<pre>${response.data}</pre>`;

    const fullHtml = `<div class="response-section"><div class="data">${dataHtml}</div></div>`;

    this.responseData.set(this.sanitizer.bypassSecurityTrustHtml(fullHtml));
    this.rawResponse.set(JSON.stringify(response.data, null, 2));
  }

  protected copyRawResponse(): void {
    const dataToCopy = this.rawResponse();
    if (dataToCopy) {
      navigator.clipboard.writeText(dataToCopy);
      this.responseMessage.set('Plain JSON response copied to clipboard.');
    }
  }

  private generateCodeSnippets(category: string, count: number): Record<string, string> {
    const encodedCategory = encodeURIComponent(category);
    const requestUrl = `${this.baseUrl}?catagory=${encodedCategory}&count=${count}`;

    return {
      javascript: `// JavaScript (modern Fetch API)
const fetchData = async () => {
  try {
    const response = await fetch('${requestUrl}');
    if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

fetchData();`,

      typescript: `// TypeScript (modern Fetch API)
interface FreeApiResponse {
  [key: string]: any;
}

const fetchData = async (): Promise<void> => {
  try {
    const response = await fetch('${requestUrl}');
    if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
    const data: FreeApiResponse = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

fetchData();`,

      csharp: `// C# (HttpClient)
using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        try
        {
            var response = await client.GetAsync("${requestUrl}");
            response.EnsureSuccessStatusCode();
            var jsonString = await response.Content.ReadAsStringAsync();
            Console.WriteLine(jsonString);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}`,

      java: `// Java 11+ (HttpClient)
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${requestUrl}"))
            .build();

        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenApply(HttpResponse::body)
            .thenAccept(System.out::println)
            .join();
    }
}`,

      python: `# Python (requests library)
import requests

url = "${requestUrl}"

try:
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    print(data)
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")`
    };
  }
}